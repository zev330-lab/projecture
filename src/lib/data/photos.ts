import photoMap from "./photo-map.json";

type PhotoEntry = {
  address: string;
  card_image: string | null;
  gallery: string[];
};

const photosByAddress: Record<string, PhotoEntry> = {};
for (const entry of Object.values(photoMap as Record<string, PhotoEntry>)) {
  photosByAddress[entry.address] = entry;
}

export function getPropertyPhotos(address: string): PhotoEntry | null {
  return photosByAddress[address] || null;
}
