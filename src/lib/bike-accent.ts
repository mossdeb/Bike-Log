import type { BikeType } from "@/lib/constants";

const BIKE_TYPE_ACCENT: Partial<Record<BikeType, { bg: string; fg: string }>> = {
  Road: { bg: "bg-sky", fg: "text-sky-foreground" },
  Gravel: { bg: "bg-terracotta", fg: "text-terracotta-foreground" },
  "Endurance road": { bg: "bg-indigo", fg: "text-indigo-foreground" },
  Enduro: { bg: "bg-emphasis", fg: "text-emphasis-foreground" },
  XC: { bg: "bg-primary", fg: "text-primary-foreground" },
  Downhill: { bg: "bg-rose", fg: "text-rose-foreground" },
  "E-MTB": { bg: "bg-teal", fg: "text-teal-foreground" },
  "Urban / Commuter": { bg: "bg-slate", fg: "text-slate-foreground" },
  Other: { bg: "bg-violet", fg: "text-violet-foreground" },
};

const DEFAULT_ACCENT = { bg: "bg-emphasis", fg: "text-emphasis-foreground" };

// One accent color per bike type, so bikes of the same type always match
// across every page regardless of sort order.
export function getBikeAccent(type?: string | null) {
  return BIKE_TYPE_ACCENT[type as BikeType] ?? DEFAULT_ACCENT;
}
