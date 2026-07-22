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

export const COMPONENT_CATEGORIES = [
  "Suspension",
  "Transmission",
  "Brakes",
  "Wheels",
  "Cockpit",
  "Frame",
  "Other",
] as const;

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
