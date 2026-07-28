import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { BikeOptionalFieldLabels } from "@/components/bike-optional-fields";

/** Extracts the plain-string subset of dict.bikes.form needed by the
 * (client-side) BikeOptionalFields — the full Dictionary can't cross the
 * server/client boundary since it also holds function-valued entries. */
export function bikeOptionalFieldLabels(dict: Dictionary): BikeOptionalFieldLabels {
  const form = dict.bikes.form;
  return {
    serialNumber: form.serialNumber,
    year: form.year,
    purchaseDate: form.purchaseDate,
    warranty: form.warranty,
    warrantyPlaceholder: form.warrantyPlaceholder,
    frameSize: form.frameSize,
    frameSizePlaceholder: form.frameSizePlaceholder,
    color: form.color,
    colorPlaceholder: form.colorPlaceholder,
    wheelSize: form.wheelSize,
    wheelSizePlaceholder: form.wheelSizePlaceholder,
    notes: form.notes,
    notesPlaceholder: form.notesPlaceholder,
    optional: form.optional,
    optionalFieldsLabel: form.optionalFieldsLabel,
    showAdditionalFields: form.showAdditionalFields,
    addDetailsTitle: form.addDetailsTitle,
    addDetailsSubtitle: form.addDetailsSubtitle,
    addDetailsSave: form.addDetailsSave,
  };
}
