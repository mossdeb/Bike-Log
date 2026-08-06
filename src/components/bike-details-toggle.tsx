"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible } from "@/components/collapsible";

/** Mobile-only compact/expanded toggle for bike details. Desktop always
 * renders the full details grid inline in the header row instead.
 *
 * Both halves stay mounted so the card can animate between them: a
 * `grid-template-rows` transition from `0fr` to `1fr` is the only way to
 * animate to a height nobody measured, and the two halves cross over —
 * one collapsing as the other opens — so the card never jumps. The half
 * that's out gets `inert`, otherwise its buttons (the Strava reload lives
 * in the expanded grid) stay tabbable behind a zero-height clip. */
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
      <Collapsible show={!open}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {compact}
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} className="bg-transparent">
            {viewLabel}
            <ChevronDown className="size-3.5" />
          </Button>
        </div>
      </Collapsible>

      <Collapsible show={open}>
        {expanded}
        <div className="mt-8 flex justify-center">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="bg-transparent">
            <X className="size-3.5" />
            {closeLabel}
          </Button>
        </div>
      </Collapsible>
    </div>
  );
}
