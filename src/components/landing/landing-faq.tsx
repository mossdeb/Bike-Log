"use client";

import { useState } from "react";
import type { LandingDictionary } from "@/components/landing/i18n/en";

export function LandingFAQ({ dict }: { dict: LandingDictionary["faq"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-[#E9EBF6] px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-12">
        <div className="flex max-w-[620px] flex-col items-center gap-3.5 text-center">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#43F3AF] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[#101014]">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {dict.badge}
          </span>
          <h2 className="font-[family-name:var(--font-landing-heading)] text-3xl font-bold leading-tight tracking-tight text-[#101014] sm:text-[36.8px]">
            {dict.title}
          </h2>
        </div>

        <div className="flex w-full max-w-[720px] flex-col gap-2.5">
          {dict.questions.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="overflow-hidden rounded-[15px] border border-[#101014]/[0.09] bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-[#101014] sm:text-base">{item.question}</span>
                  <img
                    src="/landing/icons/chevron.svg"
                    alt=""
                    className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && <div className="px-6 pb-4 text-sm leading-relaxed text-[#35363C]">{item.answer}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
