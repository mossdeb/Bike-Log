"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { updatePreferences } from "@/lib/actions/settings";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

export function PreferencesForm({
  distanceUnit,
  language,
  prefs,
}: {
  distanceUnit: string;
  language: string;
  prefs: Dictionary["settings"]["preferences"];
}) {
  return (
    // Keyed on the server-provided values so the form (and its uncontrolled
    // selects) fully remounts after a save instead of keeping stale DOM
    // state from before the refresh.
    <form key={`${distanceUnit}-${language}`} action={updatePreferences} className="contents">
      <div className="space-y-1.5">
        <Label htmlFor="distance-unit">{prefs.distanceUnit}</Label>
        <NativeSelect
          id="distance-unit"
          name="distance_unit"
          defaultValue={distanceUnit}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          <option value="km">{prefs.km}</option>
          <option value="mi">{prefs.mi}</option>
        </NativeSelect>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="language-preference">{prefs.language}</Label>
        <NativeSelect
          id="language-preference"
          name="language"
          defaultValue={language}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          <option value="en">{prefs.languageEn}</option>
          <option value="pt">{prefs.languagePt}</option>
        </NativeSelect>
      </div>
    </form>
  );
}
