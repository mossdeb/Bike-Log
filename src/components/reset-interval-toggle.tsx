import { Label } from "@/components/ui/label";

/** Same pill-switch look as the Settings notification toggles, but plain
 * (no auto-submit) — this is one field among many in the intervention
 * form, submitted together with the rest on Save. */
export function ResetIntervalToggle({
  title,
  label,
  defaultChecked = true,
}: {
  title: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="space-y-1.5 sm:col-span-2">
      <Label>{title}</Label>
      <div className="flex items-center justify-between gap-4 rounded-sm bg-muted px-3.5 py-3">
        <span className="text-sm font-semibold">{label}</span>
        <label className="relative inline-flex h-6 w-[42px] shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            name="resets_interval"
            defaultChecked={defaultChecked}
            className="peer sr-only"
          />
          <span className="absolute inset-0 rounded-full border border-input bg-background transition-colors peer-checked:border-transparent peer-checked:bg-primary" />
          <span className="absolute left-0.5 size-[18px] rounded-full bg-white shadow transition-transform peer-checked:translate-x-[18px]" />
        </label>
      </div>
    </div>
  );
}
