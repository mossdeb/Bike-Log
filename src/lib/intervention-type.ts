import type { ComponentType } from "react";
import { Hammer, RefreshCw } from "lucide-react";
import { ToolIcon } from "@/components/tool-icon";

export type InterventionType = "service" | "repair" | "replacement";

export const INTERVENTION_TYPE_ICON: Record<InterventionType, ComponentType<{ className?: string }>> = {
  service: ToolIcon,
  repair: Hammer,
  replacement: RefreshCw,
};
