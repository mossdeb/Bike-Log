"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Mobile-only compact/expanded toggle for bike details. Desktop always
 * renders the full details grid inline in the header row instead. */
export function BikeDetailsToggle({
  compact,
  expanded,
  viewLabel,
  closeLabel,
}: {
  compact: ReactNode;
  expanded: ReactNode;
  viewLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      {open ? (
        <>
          {expanded}
          <div className="mt-8 flex justify-center">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="bg-transparent">
              <X className="size-3.5" />
              {closeLabel}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {compact}
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} className="bg-transparent">
            {viewLabel}
            <ChevronDown className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
