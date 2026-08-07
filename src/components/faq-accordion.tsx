"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible } from "@/components/collapsible";

export type FaqItem = { question: string; answer: string };

/**
 * The FAQ, in the app's own surface.
 *
 * The questions come from the landing dictionary — same text, read from the
 * same place, exactly as the legal documents already do. What differs is the
 * surface: fixed hex and Exo 2 out there, tokens and Anek Latin in here.
 *
 * One open at a time, like the landing section. The answer rides the shared
 * `Collapsible` rather than being mounted and unmounted, so it opens to its own
 * height instead of appearing all at once.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="overflow-hidden rounded-[15px] border border-border">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-bold text-foreground sm:text-base">{item.question}</span>
              {/* transition-[rotate], not transition-transform: Tailwind v4
                  sets the individual `rotate` property, which a transform
                  transition does not watch — the chevron would snap. */}
              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-[rotate] duration-300 ease-out motion-reduce:transition-none ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <Collapsible show={isOpen}>
              <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </Collapsible>
          </div>
        );
      })}
    </div>
  );
}
