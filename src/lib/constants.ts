export const BIKE_TYPES = [
  "Road",
  "Gravel",
  "Endurance road",
  "Enduro",
  "XC",
  "Downhill",
  "E-MTB",
  "Urban / Commuter",
  "Other",
] as const;

export type BikeType = (typeof BIKE_TYPES)[number];

export const COMPONENT_CATEGORIES = [
  "Front Suspension (Fork)",
  "Rear Suspension",
  "Transmission",
  "Brakes",
  "Wheels",
  "Cockpit",
  "Frame",
  "Other",
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

// Datalist suggestions for the component name field — not an enum, users
// can type anything.
export const COMPONENT_NAME_SUGGESTIONS = [
  "Suspension fork",
  "Rear shock",
  "Drivetrain",
  "Brakes (front)",
  "Brakes (rear)",
  "Chain",
  "Cassette",
  "Tires",
  "Inner tubes",
  "Wheel bearings",
  "Cables & housing",
  "Saddle",
  "Handlebar",
  "Bottom bracket",
] as const;
