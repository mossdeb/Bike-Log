import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { ComponentOptionalFieldLabels } from "@/components/component-optional-fields";

/** Extracts the plain-string subset of dict.components.form needed by the
 * (client-side) ComponentOptionalFields — the full Dictionary can't cross
 * the server/client boundary since it also holds function-valued entries. */
export function componentOptionalFieldLabels(dict: Dictionary): ComponentOptionalFieldLabels {
  const form = dict.components.form;
  return {
    installDate: form.installDate,
    serialNumber: form.serialNumber,
    purchaseDate: form.purchaseDate,
    warranty: form.warranty,
    warrantyPlaceholder: form.warrantyPlaceholder,
    year: form.year,
    notes: form.notes,
    notesPlaceholder: form.notesPlaceholder,
    optional: form.optional,
    addDetailsLabel: form.addDetailsLabel,
    addDetailsTitle: form.addDetailsTitle,
    addDetailsSubtitle: form.addDetailsSubtitle,
    addDetailsSave: form.addDetailsSave,
  };
}
