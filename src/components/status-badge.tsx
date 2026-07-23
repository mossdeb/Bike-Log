import type { ServiceStatus } from "@/lib/maintenance/calculation";
import { cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const STYLES: Record<ServiceStatus, string> = {
  ok: "bg-success/10 text-success",
  due_soon: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
  not_configured: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  label,
  dict = getDictionary("en"),
  className,
}: {
  status: ServiceStatus;
  label?: string;
  dict?: Dictionary;
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
      {label ?? dict.status[status]}
    </span>
  );
}
