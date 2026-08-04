"use client";

import { cn } from "@/lib/utils";

/** The label + switch row shared by the email and push notification
 * sections. Uncontrolled (defaultChecked) when it's a plain form field;
 * pass `checked` for the rows whose state lives outside the form, like the
 * per-device push switch. */
export function ToggleRow({
  label,
  sub,
  name,
  defaultChecked,
  checked,
  disabled,
  onToggle,
}: {
  label: string;
  sub: string;
  name?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-t border-border py-3.5 first:border-t-0 first:pt-0",
        // Dimmed as a whole rather than just the switch — a bright label
        // next to a faded control reads as a rendering glitch.
        disabled && "opacity-40"
      )}
    >
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </div>
      <label className="relative inline-flex h-6 w-[42px] shrink-0 cursor-pointer items-center has-disabled:cursor-default">
        <input
          type="checkbox"
          name={name}
          {...(checked === undefined ? { defaultChecked } : { checked })}
          disabled={disabled}
          onChange={onToggle}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full border border-input bg-muted transition-colors peer-checked:border-transparent peer-checked:bg-foreground" />
        <span className="absolute left-0.5 size-[18px] rounded-full bg-white shadow transition-transform peer-checked:translate-x-[18px] peer-checked:bg-background" />
      </label>
    </div>
  );
}
