import type { ServiceStatus } from "@/lib/maintenance/calculation";
import { cn } from "@/lib/utils";

const FILL_STYLES: Record<ServiceStatus, string> = {
  ok: "bg-success",
  due_soon: "bg-warning",
  overdue: "bg-destructive",
  not_configured: "bg-muted-foreground/30",
};

export function ServiceIntervalBar({
  status,
  fraction,
  className,
}: {
  status: ServiceStatus;
  fraction: number | null;
  className?: string;
}) {
  if (fraction == null) return null;
  const percent = Math.min(Math.max(fraction, 0), 1) * 100;

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full", FILL_STYLES[status])} style={{ width: `${percent}%` }} />
    </div>
  );
}
