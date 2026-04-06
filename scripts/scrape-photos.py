#!/usr/bin/env python3
"""
Scrape project photos from Bay State Remodeling and Bay State Kitchen Gallery.

Uses the WordPress REST API to discover projects and their gallery images,
then downloads the best/largest "after" images to public/images/projects/.

Usage: python3 scripts/scrape-photos.py
"""

import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import requests

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "public" / "images" / "projects"
MANIFEST_PATH = BASE_DIR / "src" / "lib" / "data" / "project-photos.json"

SITES = [
    {
        "name": "remodeling",
        "base_url": "https://baystateremodeling.com",
        "api_url": "https://baystateremodeling.com/wp-json/wp/v2/project",
    },
    {
        "name": "kitchen-gallery",
        "base_url": "https://baystatekitchengallery.com",
        "api_url": "https://baystatekitchengallery.com/wp-json/wp/v2/project",
    },
]

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Projecture-PhotoScraper/1.0 (internal use)"
})


def fetch_all_projects(api_url: str) -> list[dict]:
    """Fetch all projects from the WP REST API with pagination."""
    projects = []
    page = 1
    while True:
        print(f"  Fetching page {page}...")
        resp = SESSION.get(api_url, params={
            "per_page": 100,
            "page": page,
            "_embed": "true",
        }, timeout=30)

        if resp.status_code == 400:
            break  # No more pages
        resp.raise_for_status()

        data = resp.json()
        if not data:
            break

        projects.extend(data)
        total_pages = int(resp.headers.get("X-WP-TotalPages", 1))
        if page >= total_pages:
            break
        page += 1
        time.sleep(0.5)

    return projects


def extract_image_urls(project: dict) -> dict:
    """Extract before/after/gallery image URLs from a project's API response."""
    content = project.get("content", {}).get("rendered", "")
    acf = project.get("acf", {}) or {}
    slug = project.get("slug", "")
    title = project.get("title", {}).get("rendered", "")

    result = {
        "slug": slug,
        "title": title,
        "category": categorize_project(slug),
        "before_main": None,
        "after_main": None,
        "after_gallery": [],
        "before_gallery": [],
    }

    # Extract before/after slider images from ACF or content
    # Check known ACF field patterns
    for key in ["before_after_slider_before_image", "before_image", "ba_before"]:
        val = acf.get(key)
        if isinstance(val, str) and val.startswith("http"):
            result["before_main"] = val
            break
        elif isinstance(val, dict) and "url" in val:
            result["before_main"] = val["url"]
            break

    for key in ["before_after_slider_after_image", "after_image", "ba_after"]:
        val = acf.get(key)
        if isinstance(val, str) and val.startswith("http"):
            result["after_main"] = val
            break
        elif isinstance(val, dict) and "url" in val:
            result["after_main"] = val["url"]
            break

    # Extract gallery images from ACF
    for key in ["after_gallery", "after_photos", "gallery_after"]:
        val = acf.get(key)
        if isinstance(val, list):
            for item in val:
                if isinstance(item, str) and item.startswith("http"):
                    result["after_gallery"].append(item)
                elif isinstance(item, dict) and "url" in item:
                    result["after_gallery"].append(item["url"])

    for key in ["before_gallery", "before_photos", "gallery_before"]:
        val = acf.get(key)
        if isinstance(val, list):
            for item in val:
                if isinstance(item, str) and item.startswith("http"):
                    result["before_gallery"].append(item)
                elif isinstance(item, dict) and "url" in item:
                    result["before_gallery"].append(item["url"])

    # Also try to extract images from embedded featured media
    embedded = project.get("_embedded", {})
    featured_media = embedded.get("wp:featuredmedia", [{}])
    if featured_media:
        fm = featured_media[0] if isinstance(featured_media, list) else featured_media
        if isinstance(fm, dict):
            source_url = fm.get("source_url")
            if source_url:
                if not result["after_main"]:
                    result["after_main"] = source_url

    # Extract images from HTML content using regex
    img_urls = re.findall(r'https?://[^"\'>\s]+/wp-content/uploads/[^"\'>\s]+\.(?:jpg|jpeg|png|webp)', content)
    for url in img_urls:
        # Remove size suffixes to get full-size image
        clean = re.sub(r'-\d+x\d+(?=\.\w+$)', '', url)
        if "after" in clean.lower() and clean not in result["after_gallery"]:
            result["after_gallery"].append(clean)
        elif "before" in clean.lower() and clean not in result["before_gallery"]:
            result["before_gallery"].append(clean)

    # Try to find images by probing numbered URLs based on the main image pattern
    for main_url in [result["after_main"], result["before_main"]]:
        if not main_url:
            continue
        # Pattern: slug-after-type-remodeling-N.jpg or slug-after-type-remodeling-main.jpg
        base_pattern = re.sub(r'-(?:main|\d+)(?=\.\w+$)', '', main_url)
        target_list = result["after_gallery"] if "after" in main_url else result["before_gallery"]

        for n in range(1, 20):
            ext = main_url.rsplit(".", 1)[-1]
            probe_url = f"{base_pattern}-{n}.{ext}"
            if probe_url not in target_list and probe_url != main_url:
                try:
                    head = SESSION.head(probe_url, timeout=5, allow_redirects=True)
                    if head.status_code == 200:
                        content_type = head.headers.get("content-type", "")
                        if "image" in content_type:
                            target_list.append(probe_url)
                    else:
                        break  # Stop probing if we get a miss
                except Exception:
                    break

    # Deduplicate
    result["after_gallery"] = list(dict.fromkeys(result["after_gallery"]))
    result["before_gallery"] = list(dict.fromkeys(result["before_gallery"]))

    return result


def categorize_project(slug: str) -> str:
    """Determine the category based on the project slug."""
    slug_lower = slug.lower()
    if "kitchen" in slug_lower:
        return "kitchen"
    elif "bath" in slug_lower:
        return "bathroom"
    elif "basement" in slug_lower:
        return "basement"
    elif "attic" in slug_lower:
        return "attic"
    elif "whole-home" in slug_lower:
        return "whole-home"
    elif "other-spaces" in slug_lower:
        return "other"
    else:
        return "other"


def download_image(url: str, dest_path: Path) -> bool:
    """Download an image to the given path. Returns True on success."""
    if dest_path.exists():
        print(f"    [skip] {dest_path.name} (exists)")
        return True

    try:
        resp = SESSION.get(url, timeout=30, stream=True)
        resp.raise_for_status()

        content_type = resp.headers.get("content-type", "")
        if "image" not in content_type:
            print(f"    [skip] {url} (not an image: {content_type})")
            return False

        dest_path.parent.mkdir(parents=True, exist_ok=True)
        with open(dest_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        size_kb = dest_path.stat().st_size / 1024
        print(f"    [ok] {dest_path.name} ({size_kb:.0f}KB)")
        return True
    except Exception as e:
        print(f"    [error] {url}: {e}")
        return False


def url_to_filename(url: str) -> str:
    """Convert a URL to a safe filename."""
    parsed = urlparse(url)
    path = parsed.path
    # Get the filename from the path
    filename = path.split("/")[-1]
    # Remove size suffixes
    filename = re.sub(r'-\d+x\d+(?=\.\w+$)', '', filename)
    return filename


def main():
    manifest = {
        "remodeling": {},
        "kitchen-gallery": {},
    }

    total_downloaded = 0

    for site in SITES:
        name = site["name"]
        out_dir = OUTPUT_DIR / name
        out_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n{'='*60}")
        print(f"Scraping {site['base_url']}")
        print(f"{'='*60}")

        projects = fetch_all_projects(site["api_url"])
        print(f"Found {len(projects)} projects\n")

        for project in projects:
            images = extract_image_urls(project)
            slug = images["slug"]
            category = images["category"]

            # Collect all after images (prefer after, fall back to before)
            all_images = []
            if images["after_main"]:
                all_images.append(images["after_main"])
            all_images.extend(images["after_gallery"])

            # Also include before_main as a secondary option
            if images["before_main"]:
                all_images.append(images["before_main"])

            if not all_images:
                print(f"  [{slug}] No images found, skipping")
                continue

            print(f"  [{slug}] {category} — {len(all_images)} images")

            project_dir = out_dir / slug
            downloaded_files = []

            for url in all_images:
                filename = url_to_filename(url)
                dest = project_dir / filename
                if download_image(url, dest):
                    # Store relative path from public/
                    rel_path = str(dest.relative_to(BASE_DIR / "public"))
                    downloaded_files.append({
                        "path": "/" + rel_path,
                        "is_after": "after" in url.lower(),
                        "is_before": "before" in url.lower(),
                        "is_main": "main" in url.lower() or url == images["after_main"],
                    })
                    total_downloaded += 1

            if downloaded_files:
                manifest[name][slug] = {
                    "title": images["title"],
                    "category": category,
                    "images": downloaded_files,
                }

            time.sleep(0.3)  # Be respectful

    # Write manifest
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n{'='*60}")
    print(f"DONE — Downloaded {total_downloaded} images total")
    print(f"Manifest written to {MANIFEST_PATH}")
    print(f"{'='*60}")

    # Print summary by category
    for site_name, projects in manifest.items():
        cats = {}
        for slug, data in projects.items():
            cat = data["category"]
            cats[cat] = cats.get(cat, 0) + len(data["images"])
        print(f"\n{site_name}:")
        for cat, count in sorted(cats.items()):
            print(f"  {cat}: {count} images")


if __name__ == "__main__":
    main()
