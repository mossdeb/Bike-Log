import Link from "next/link";
import type { LandingDictionary } from "@/components/landing/i18n/en";

export function LandingPricing({ dict }: { dict: LandingDictionary["pricing"] }) {
  return (
    <section id="precos" className="bg-white px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-12">
        <div className="flex max-w-[620px] flex-col items-center gap-3.5 text-center">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#43F3AF] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[#101014]">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {dict.badge}
          </span>
          <h2 className="font-[family-name:var(--font-landing-heading)] text-3xl font-bold leading-tight tracking-tight text-[#101014] sm:text-[36.8px]">
            {dict.title}
          </h2>
          <p className="text-base leading-relaxed text-[#35363C] sm:text-[16.3px]">{dict.subtitle}</p>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
          {dict.plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-[22px] border p-7 ${
                plan.highlighted ? "border-transparent bg-[#101014]" : "border-[#101014]/[0.09] bg-white"
              }`}
            >
              {plan.badge && (
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[#43F3AF] px-3 py-1 text-xs font-bold text-[#101014]">
                  {plan.badge}
                </span>
              )}
              <h3 className={`font-[family-name:var(--font-landing-heading)] text-xl font-bold ${plan.highlighted ? "text-white" : "text-[#101014]"}`}>
                {plan.name}
              </h3>
              <p className={`mt-1.5 text-sm ${plan.highlighted ? "text-white/60" : "text-[#8A8D93]"}`}>
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span
                  className={`font-[family-name:var(--font-landing-heading)] text-4xl font-extrabold ${plan.highlighted ? "text-white" : "text-[#101014]"}`}
                >
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? "text-white/50" : "text-[#8A8D93]"}`}>{plan.period}</span>
              </div>

              {/* No tick: it introduces the list rather than being an item in
                  it, and it carries the full text colour so it reads as the
                  summary it is instead of as a caption. */}
              {plan.featuresLead && (
                <p className={`mt-6 text-sm font-bold ${plan.highlighted ? "text-white" : "text-[#101014]"}`}>
                  {plan.featuresLead}
                </p>
              )}

              {/* flex-1 on the list, not mt-auto on the button: the free space
                  goes to the list, so the three CTAs line up at the bottom of
                  the equal-height cards and still keep their mt-8 gap. */}
              <ul className={`flex flex-1 flex-col gap-3 ${plan.featuresLead ? "mt-3" : "mt-6"}`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        plan.highlighted ? "bg-[#43F3AF]" : "bg-[#43F3AF]/20"
                      }`}
                    >
                      <img src="/landing/icons/checkmark.svg" alt="" className="h-3 w-3" />
                    </span>
                    <span className={`text-sm ${plan.highlighted ? "text-white/90" : "text-[#35363C]"}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold transition-opacity hover:opacity-90 ${
                  plan.highlighted ? "bg-[#43F3AF] text-[#101014]" : "border border-[#101014]/[0.09] bg-white text-[#101014]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
