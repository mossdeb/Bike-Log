import { StravaIcon } from "@/components/strava-icon";
import { Button } from "@/components/ui/button";
import { connectStrava } from "@/lib/actions/strava";

/** Same muted row used in Settings' Strava section — reused wherever a bike
 * form needs to prompt for a Strava connection instead of just pointing the
 * user elsewhere to go make it. */
export function StravaConnectRow({ label, connectLabel }: { label: string; connectLabel: string }) {
  return (
    <div className="flex items-center gap-3 rounded-sm bg-muted px-3.5 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-inset ring-border">
        <StravaIcon className="size-4" />
      </span>
      <span className="text-sm font-semibold">{label}</span>
      <form action={connectStrava} className="ml-auto">
        <Button type="submit" variant="outline" size="sm">
          {connectLabel}
        </Button>
      </form>
    </div>
  );
}
