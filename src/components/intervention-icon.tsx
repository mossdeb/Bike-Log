import { cn } from "@/lib/utils";
import { INTERVENTION_TYPE_ICON, type InterventionType } from "@/lib/intervention-type";

const STYLES: Record<InterventionType, string> = {
  service: "bg-indigo text-indigo-foreground",
  repair: "bg-primary text-primary-foreground",
  replacement: "bg-emphasis text-emphasis-foreground",
};

export function InterventionIcon({ type, className }: { type: InterventionType; className?: string }) {
  const Icon = INTERVENTION_TYPE_ICON[type];
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", STYLES[type], className)}>
      <Icon className="size-[18px]" />
    </span>
  );
}
