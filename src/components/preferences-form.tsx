"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { updatePreferences } from "@/lib/actions/settings";
import { Label } from "@/components/ui/label";

export function PreferencesForm({
  distanceUnit,
  language,
  prefs,
  selectClassName,
}: {
  distanceUnit: string;
  language: string;
  prefs: Dictionary["settings"]["preferences"];
  selectClassName: string;
}) {
  return (
    // Keyed on the server-provided values so the form (and its uncontrolled
    // selects) fully remounts after a save instead of keeping stale DOM
    // state from before the refresh.
    <form key={`${distanceUnit}-${language}`} action={updatePreferences} className="contents">
      <div className="space-y-1.5">
        <Label htmlFor="distance-unit">{prefs.distanceUnit}</Label>
        <select
          id="distance-unit"
          name="distance_unit"
          defaultValue={distanceUnit}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className={selectClassName}
        >
          <option value="km">{prefs.km}</option>
          <option value="mi">{prefs.mi}</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="language-preference">{prefs.language}</Label>
        <select
          id="language-preference"
          name="language"
          defaultValue={language}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className={selectClassName}
        >
          <option value="en">{prefs.languageEn}</option>
          <option value="pt">{prefs.languagePt}</option>
        </select>
      </div>
    </form>
  );
}
