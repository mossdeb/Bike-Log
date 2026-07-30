"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type FieldKey = "install_date" | "serial_number" | "purchase_date" | "warranty" | "year" | "notes";

export interface ComponentOptionalFieldDefaults {
  install_date?: string | null;
  serial_number?: string | null;
  purchase_date?: string | null;
  warranty?: string | null;
  year?: number | null;
  notes?: string | null;
}

// Plain strings only — this is a client component, and the full Dictionary
// object can't cross the server/client boundary (it also holds
// function-valued entries for unrelated sections).
export interface ComponentOptionalFieldLabels {
  installDate: string;
  serialNumber: string;
  purchaseDate: string;
  warranty: string;
  warrantyPlaceholder: string;
  year: string;
  notes: string;
  notesPlaceholder: string;
  optional: string;
  addDetailsLabel: string;
  addDetailsTitle: string;
  addDetailsSubtitle: string;
  addDetailsSave: string;
}

// Order the fields appear in the checkbox picker — matches the approved mockup.
const CHECKBOX_ORDER: FieldKey[] = ["install_date", "serial_number", "purchase_date", "warranty", "year", "notes"];

export function ComponentOptionalFields({
  labels,
  defaults = {},
}: {
  labels: ComponentOptionalFieldLabels;
  defaults?: ComponentOptionalFieldDefaults;
}) {
  const fieldConfig: Record<FieldKey, { label: string; placeholder?: string; type?: string }> = {
    install_date: { label: labels.installDate, type: "date" },
    serial_number: { label: labels.serialNumber, placeholder: labels.optional },
    purchase_date: { label: labels.purchaseDate, type: "date" },
    warranty: { label: labels.warranty, placeholder: labels.warrantyPlaceholder },
    year: { label: labels.year, type: "number" },
    notes: { label: labels.notes, placeholder: labels.notesPlaceholder },
  };

  const initialActive = new Set(
    CHECKBOX_ORDER.filter((key) => {
      const value = defaults[key];
      return value != null && value !== "";
    })
  );

  const [activeFields, setActiveFields] = useState(initialActive);
  const [pendingFields, setPendingFields] = useState(initialActive);
  const [open, setOpen] = useState(false);

  function renderField(key: FieldKey, fullWidth: boolean) {
    const { label, placeholder, type } = fieldConfig[key];
    return (
      <div key={key} className={fullWidth ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
        <Label htmlFor={key}>{label}</Label>
        {key === "notes" ? (
          <Textarea id={key} name={key} placeholder={placeholder} defaultValue={defaults.notes ?? ""} />
        ) : (
          <Input id={key} name={key} type={type ?? "text"} placeholder={placeholder} defaultValue={defaults[key] ?? ""} />
        )}
      </div>
    );
  }

  const purchaseActive = activeFields.has("purchase_date");
  const warrantyActive = activeFields.has("warranty");

  return (
    <>
      {activeFields.has("install_date") && renderField("install_date", true)}
      {activeFields.has("serial_number") && renderField("serial_number", true)}

      {purchaseActive && warrantyActive ? (
        <div className="grid grid-cols-2 gap-5 sm:contents">
          {renderField("purchase_date", false)}
          {renderField("warranty", false)}
        </div>
      ) : (
        <>
          {purchaseActive && renderField("purchase_date", true)}
          {warrantyActive && renderField("warranty", true)}
        </>
      )}

      {activeFields.has("year") && renderField("year", false)}
      {activeFields.has("notes") && renderField("notes", true)}

      <div className="sm:col-span-2">
        <Dialog
          open={open}
          onOpenChange={(next) => {
            if (next) setPendingFields(new Set(activeFields));
            setOpen(next);
          }}
        >
          <DialogTrigger
            type="button"
            className="flex h-[52px] w-full items-center justify-between rounded-[12px] border border-dashed border-input px-5 text-sm font-semibold text-foreground transition-colors hover:border-foreground/40"
          >
            {labels.addDetailsLabel}
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-input">
              <Plus className="size-4" />
            </span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{labels.addDetailsTitle}</DialogTitle>
              <DialogDescription>{labels.addDetailsSubtitle}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2.5">
              {CHECKBOX_ORDER.map((key) => {
                const checked = pendingFields.has(key);
                return (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2.5 rounded-sm bg-muted px-3.5 py-3 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) => {
                        setPendingFields((prev) => {
                          const updated = new Set(prev);
                          if (next) updated.add(key);
                          else updated.delete(key);
                          return updated;
                        });
                      }}
                    />
                    {fieldConfig[key].label}
                  </label>
                );
              })}
            </div>

            <DialogClose
              render={
                <Button type="button" className="w-full" onClick={() => setActiveFields(new Set(pendingFields))}>
                  {labels.addDetailsSave}
                </Button>
              }
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
