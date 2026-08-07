import type { LandingDictionary } from "@/components/landing/i18n/en";

/** One illustration per step, in step order. They keep their own aspect ratios
 * — 109×89, 202×104 and 216×99 — and are capped by height so the three sit on
 * a common band however wide each one turns out. */
const STEP_ARTWORK = ["/landing/process/step-1.svg", "/landing/process/step-2.svg", "/landing/process/step-3.svg"];

export function LandingHowItWorks({ dict }: { dict: LandingDictionary["howItWorks"] }) {
  // `bg-linear-to-b`, not `bg-gradient-to-b`: Tailwind v4 renamed it, and the
  // old name is only kept as a deprecated alias.
  return (
    <section
      id="como-funciona"
      className="bg-linear-to-b from-[#E9EBF6] to-[#F1F1F1] px-4 py-16 sm:px-8 md:py-24"
    >
      <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-12">
        <div className="flex max-w-[620px] flex-col items-center gap-3.5 text-center">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#43F3AF] px-3.5 py-1.5 text-xs font-bold tracking-wide text-[#101014] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {dict.badge}
          </span>
          <h2 className="font-[family-name:var(--font-landing-heading)] text-3xl leading-tight font-bold tracking-tight text-[#101014] sm:text-[36.8px]">
            {dict.title}
          </h2>
          <p className="text-base leading-relaxed text-[#35363C] sm:text-[16.3px]">
            {dict.subtitle} <strong className="font-bold text-[#101014]">{dict.subtitleStrong}</strong>
          </p>
        </div>

        {/* The row-gap is wider than the column-gap: the step number straddles
            the top edge of each card, and stacked on a phone it would otherwise
            sit on the card above it. */}
        <div className="grid w-full grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-3">
          {dict.steps.map((step, index) => (
            <div key={step.title} className="relative rounded-[22px] bg-white px-6 pt-10 pb-7 sm:px-7">
              {/* Centred on the card's top edge — the badge is 52px across
                  with its halo, so half of that is the offset. The halo is a
                  second circle rather than a ring utility so it stays a glow
                  at any zoom, and the padding carries the whole difference
                  between the two circles: 36 + 8 + 8 keeps the outer size the
                  card was laid out against. */}
              <span className="absolute -top-[26px] left-1/2 -translate-x-1/2 rounded-full bg-[#43F3AF]/25 p-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#43F3AF] text-sm font-bold text-[#101014]">
                  {index + 1}
                </span>
              </span>

              {/* Centred under the step number that straddles the card's top
                  edge — `block` because an inline image ignores auto margins.
                  Bounded on both axes rather than given a height: a replaced
                  element keeps its ratio between a max-width and a max-height,
                  where a fixed height plus a max-width would squash it. */}
              <img
                src={STEP_ARTWORK[index]}
                alt=""
                // 20% down, and `zoom` rather than `scale`: a transform would
                // shrink the drawing and leave the layout box at full size,
                // dropping a band of empty space under each one. The three
                // keep their relative sizes, which a lower max-height would
                // have flattened — only the tallest is anywhere near the cap.
                className="mx-auto block max-h-[104px] w-auto max-w-full [zoom:0.8]"
              />

              <h3 className="mt-5 font-[family-name:var(--font-landing-heading)] text-lg font-bold text-[#101014]">
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
