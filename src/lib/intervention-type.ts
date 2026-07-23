import { Wrench, Hammer, RefreshCw, type LucideIcon } from "lucide-react";

export type InterventionType = "service" | "repair" | "replacement";

export const INTERVENTION_TYPE_ICON: Record<InterventionType, LucideIcon> = {
  service: Wrench,
  repair: Hammer,
  replacement: RefreshCw,
};
