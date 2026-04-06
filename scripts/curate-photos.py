#!/usr/bin/env python3
"""
Curate scraped photos: select the best images for each property,
create a mapping JSON, and delete unused images to keep the repo lean.

Run after scrape-photos.py.
Usage: python3 scripts/curate-photos.py
"""

import json
import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MANIFEST_PATH = BASE_DIR / "src" / "lib" / "data" / "project-photos.json"
SEED_DATA_PATH = BASE_DIR / "src" / "lib" / "data" / "seed-data.json"
PROJECTS_DIR = BASE_DIR / "public" / "images" / "projects"
CURATED_DIR = BASE_DIR / "public" / "images" / "curated"
OUTPUT_PATH = BASE_DIR / "src" / "lib" / "data" / "photo-map.json"

# Max images to keep per category pool
MAX_PER_CATEGORY = 30
# Images per property
IMAGES_PER_PROPERTY = 6


def get_file_size(path: str) -> int:
    """Get file size of an image from its public-relative path."""
    full_path = BASE_DIR / "public" / path.lstrip("/")
    if full_path.exists():
        return full_path.stat().st_size
    return 0


def build_category_pools(manifest: dict) -> dict[str, list[dict]]:
    """Build pools of best after-images per category, sorted by file size (largest first)."""
    pools: dict[str, list[dict]] = {
        "kitchen": [],
        "bathroom": [],
        "whole-home": [],
        "basement": [],
        "attic": [],
        "exterior": [],
        "other": [],
    }

    # Prioritize Newton projects
    newton_slugs = set()

    for site_name, projects in manifest.items():
        for slug, data in projects.items():
            category = data["category"]
            if category not in pools:
                pools[category] = []

            is_newton = "newton" in slug.lower()
            if is_newton:
                newton_slugs.add(slug)

            # Only take "after" images, prefer "main" images
            after_images = [
                img for img in data["images"]
                if img["is_after"] and not img["is_before"]
            ]

            if not after_images:
                # Fall back to any images
                after_images = data["images"]

            for img in after_images:
                size = get_file_size(img["path"])
                if size < 20000:  # Skip tiny images (<20KB)
                    continue
                pools[category].append({
                    "path": img["path"],
                    "size": size,
                    "is_main": img["is_main"],
                    "is_newton": is_newton,
                    "slug": slug,
                    "site": site_name,
                })

    # Sort each pool: Newton first, then main images, then by size
    for cat in pools:
        pools[cat].sort(key=lambda x: (
            -int(x["is_newton"]),
            -int(x["is_main"]),
            -x["size"],
        ))
        # Deduplicate by path
        seen = set()
        deduped = []
        for img in pools[cat]:
            if img["path"] not in seen:
                seen.add(img["path"])
                deduped.append(img)
        pools[cat] = deduped[:MAX_PER_CATEGORY]

    return pools


def assign_photos_to_properties(seed_data: dict, pools: dict) -> dict:
    """Assign curated photos to each property based on their included_features."""
    photo_map = {}

    # Track which photos have been used to avoid duplicates
    used_paths = set()

    for i, prop in enumerate(seed_data["properties"]):
        address = prop["address"]
        features = prop.get("included_features", []) or []
        features_text = " ".join(features).lower()
        prop_type = (prop.get("property_type") or "").lower()

        # Determine which categories are relevant for this property
        needs_kitchen = "kitchen" in features_text
        needs_bath = "bath" in features_text or "spa" in features_text
        needs_basement = "basement" in features_text or "lower level" in features_text
        needs_exterior = "exterior" in features_text or "landscap" in features_text or "window" in features_text

        assigned = []

        def pick_from(category: str, count: int):
            picked = 0
            for img in pools.get(category, []):
                if picked >= count:
                    break
                if img["path"] not in used_paths:
                    assigned.append(img["path"])
                    used_paths.add(img["path"])
                    picked += 1

        # Card image: pick best kitchen or whole-home image
        if needs_kitchen and pools.get("kitchen"):
            pick_from("kitchen", 1)
        elif pools.get("whole-home"):
            pick_from("whole-home", 1)
        else:
            pick_from("kitchen", 1)

        # Detail page gallery: mix of categories
        if needs_kitchen:
            pick_from("kitchen", 2)
        if needs_bath:
            pick_from("bathroom", 2)
        if needs_basement:
            pick_from("basement", 1)
        if needs_exterior:
            pick_from("exterior", 1)

        # Fill remaining slots
        remaining = IMAGES_PER_PROPERTY - len(assigned)
        if remaining > 0 and needs_kitchen:
            pick_from("kitchen", remaining)
        remaining = IMAGES_PER_PROPERTY - len(assigned)
        if remaining > 0:
            pick_from("bathroom", remaining)
        remaining = IMAGES_PER_PROPERTY - len(assigned)
        if remaining > 0:
            pick_from("whole-home", remaining)
        remaining = IMAGES_PER_PROPERTY - len(assigned)
        if remaining > 0:
            pick_from("other", remaining)

        photo_map[str(i)] = {
            "address": address,
            "card_image": assigned[0] if assigned else None,
            "gallery": assigned[:IMAGES_PER_PROPERTY],
        }

    return photo_map


def copy_curated_images(photo_map: dict):
    """Copy only the images we're using to the curated directory."""
    CURATED_DIR.mkdir(parents=True, exist_ok=True)

    all_paths = set()
    for prop in photo_map.values():
        if prop["card_image"]:
            all_paths.add(prop["card_image"])
        for path in prop["gallery"]:
            all_paths.add(path)

    copied = 0
    for rel_path in all_paths:
        src = BASE_DIR / "public" / rel_path.lstrip("/")
        # Flatten into curated dir
        filename = src.name
        dest = CURATED_DIR / filename
        if src.exists() and not dest.exists():
            shutil.copy2(src, dest)
            copied += 1

    print(f"Copied {copied} images to {CURATED_DIR}")

    # Update paths in photo_map to point to curated dir
    for prop in photo_map.values():
        if prop["card_image"]:
            filename = Path(prop["card_image"]).name
            prop["card_image"] = f"/images/curated/{filename}"
        prop["gallery"] = [
            f"/images/curated/{Path(p).name}" for p in prop["gallery"]
        ]

    return photo_map


def cleanup_raw_images():
    """Remove the large raw scraped images directory."""
    if PROJECTS_DIR.exists():
        size_mb = sum(f.stat().st_size for f in PROJECTS_DIR.rglob("*") if f.is_file()) / (1024 * 1024)
        print(f"Removing raw images ({size_mb:.0f}MB)...")
        shutil.rmtree(PROJECTS_DIR)
        print("Done.")


def main():
    with open(MANIFEST_PATH) as f:
        manifest = json.load(f)

    with open(SEED_DATA_PATH) as f:
        seed_data = json.load(f)

    print("Building category pools...")
    pools = build_category_pools(manifest)
    for cat, images in pools.items():
        print(f"  {cat}: {len(images)} candidates")

    print("\nAssigning photos to properties...")
    photo_map = assign_photos_to_properties(seed_data, pools)
    for idx, data in photo_map.items():
        print(f"  [{idx}] {data['address']}: {len(data['gallery'])} images")

    print("\nCopying curated images...")
    photo_map = copy_curated_images(photo_map)

    # Write the final mapping
    with open(OUTPUT_PATH, "w") as f:
        json.dump(photo_map, f, indent=2)
    print(f"\nPhoto map written to {OUTPUT_PATH}")

    # Cleanup
    cleanup_raw_images()

    # Summary
    total_images = sum(len(p["gallery"]) for p in photo_map.values())
    curated_count = len(list(CURATED_DIR.glob("*")))
    curated_size = sum(f.stat().st_size for f in CURATED_DIR.glob("*")) / (1024 * 1024)
    print(f"\nFinal: {curated_count} curated images ({curated_size:.1f}MB)")
    print(f"Assigned {total_images} image slots across {len(photo_map)} properties")


if __name__ == "__main__":
    main()
