import type { ServiceStatus } from "@/lib/maintenance/calculation";
import { cn } from "@/lib/utils";

const LABELS: Record<ServiceStatus, string> = {
  ok: "On schedule",
  due_soon: "Due soon",
  overdue: "Overdue",
  not_configured: "Not set",
};

const STYLES: Record<ServiceStatus, string> = {
  ok: "bg-success/10 text-success",
  due_soon: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
  not_configured: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: ServiceStatus;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold before:size-1.5 before:shrink-0 before:rounded-full before:bg-current before:content-['']",
        STYLES[status],
        className
      )}
    >
      {label ?? LABELS[status]}
    </span>
  );
}
