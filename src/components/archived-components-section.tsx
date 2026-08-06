"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible } from "@/components/collapsible";

/**
 * The bike's archived parts, folded away under its fitted ones.
 *
 * This started as a third tab and was too loud for it: three equal headings
 * gave a list opened once a season the same weight as the one opened every
 * time, and at 375px the three of them took 355px of the row. Here it costs a
 * single line, and it sits where someone would actually look for a part that
 * used to be on the bike — under the parts that still are.
 */
export function ArchivedComponentsSection({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        // Centred on a phone, where it reads as a footer to the list above it;
        // left-aligned from sm, where it lines up with the cards' own edge.
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 py-1 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:justify-start sm:text-left"
      >
        {label}
        <span className="font-normal">({count})</span>
        <ChevronDown
          className={cn(
            "ml-0.5 size-4 transition-transform duration-300 motion-reduce:transition-none",
            open && "rotate-180"
          )}
        />
      </button>
      <Collapsible show={open}>
        <div className="pt-4">{children}</div>
      </Collapsible>
    </div>
  );
}
