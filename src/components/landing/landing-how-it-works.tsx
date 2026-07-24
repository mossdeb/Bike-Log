import type { LandingDictionary } from "@/components/landing/i18n/en";

export function LandingHowItWorks({ dict }: { dict: LandingDictionary["howItWorks"] }) {
  return (
    <section id="como-funciona" className="bg-[#E9EBF6] px-4 py-16 sm:px-8 md:py-24">
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

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
          {dict.steps.map((step, index) => (
            <div key={step.title} className="rounded-[22px] bg-white p-6 sm:p-7">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#43F3AF] text-sm font-bold text-[#101014]">
                {index + 1}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-landing-heading)] text-lg font-bold text-[#101014]">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#35363C]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
