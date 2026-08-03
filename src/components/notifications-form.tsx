"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { updateNotificationPreferences } from "@/lib/actions/settings";

function ToggleRow({
  label,
  sub,
  name,
  defaultChecked,
  onToggle,
}: {
  label: string;
  sub: string;
  name: string;
  defaultChecked: boolean;
  onToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-3.5 first:border-t-0 first:pt-0">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </div>
      <label className="relative inline-flex h-6 w-[42px] shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          onChange={onToggle}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full border border-input bg-muted transition-colors peer-checked:border-transparent peer-checked:bg-foreground" />
        <span className="absolute left-0.5 size-[18px] rounded-full bg-white shadow transition-transform peer-checked:translate-x-[18px] peer-checked:bg-background" />
      </label>
    </div>
  );
}

export function NotificationsForm({
  prefs,
  dict,
}: {
  prefs: { dueSoon: boolean; overdue: boolean; weeklySummary: boolean };
  dict: Dictionary["settings"]["notifications"];
}) {
  return (
    <form
      key={`${prefs.dueSoon}-${prefs.overdue}-${prefs.weeklySummary}`}
      action={updateNotificationPreferences}
    >
      <ToggleRow
        label={dict.dueSoon}
        sub={dict.dueSoonSub}
        name="notify_due_soon"
        defaultChecked={prefs.dueSoon}
        onToggle={(e) => e.currentTarget.form?.requestSubmit()}
      />
      <ToggleRow
        label={dict.overdue}
        sub={dict.overdueSub}
        name="notify_overdue"
        defaultChecked={prefs.overdue}
        onToggle={(e) => e.currentTarget.form?.requestSubmit()}
      />
      <ToggleRow
        label={dict.weeklySummary}
        sub={dict.weeklySummarySub}
        name="notify_weekly_summary"
        defaultChecked={prefs.weeklySummary}
        onToggle={(e) => e.currentTarget.form?.requestSubmit()}
      />
    </form>
  );
}
