import type { ComponentType } from "react";
import { RefreshCw } from "lucide-react";
import { ToolIcon } from "@/components/tool-icon";
import { RepairIcon } from "@/components/repair-icon";

export type InterventionType = "service" | "repair" | "replacement";

export const INTERVENTION_TYPE_ICON: Record<InterventionType, ComponentType<{ className?: string }>> = {
  service: ToolIcon,
  repair: RepairIcon,
  replacement: RefreshCw,
};
