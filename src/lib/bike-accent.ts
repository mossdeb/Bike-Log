const BIKE_ACCENT_PALETTE = [
  { bg: "bg-primary", fg: "text-primary-foreground" },
  { bg: "bg-indigo", fg: "text-indigo-foreground" },
  { bg: "bg-emphasis", fg: "text-emphasis-foreground" },
];

// Deterministic per-bike so the same bike gets the same accent color
// everywhere, regardless of which page's sort order it's rendered in.
export function getBikeAccent(bikeId: string) {
  let hash = 0;
  for (let i = 0; i < bikeId.length; i++) {
    hash = (hash * 31 + bikeId.charCodeAt(i)) | 0;
  }
  return BIKE_ACCENT_PALETTE[Math.abs(hash) % BIKE_ACCENT_PALETTE.length];
}
