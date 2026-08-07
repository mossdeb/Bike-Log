import type { ReactNode } from "react";
import type { LandingDictionary } from "@/components/landing/i18n/en";

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#43F3AF] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[#101014]">
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
      {children}
    </span>
  );
}

function ComponentRow({
  icon,
  title,
  subtitle,
  last,
}: {
  icon: string;
  title: string;
  subtitle: string;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-2.5 ${last ? "" : "border-b border-[#101014]/[0.09]"}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F1F1]">
        <img src={icon} alt="" className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-bold text-[#101014]">{title}</p>
        <p className="text-xs text-[#8A8D93]">{subtitle}</p>
      </div>
    </div>
  );
}

function AlertRow({
  icon,
  title,
  subtitle,
  status,
  statusColor,
}: {
  icon: string;
  title: string;
  subtitle: string;
  status: string;
  statusColor: "success" | "warning" | "danger";
}) {
  const colorMap = {
    success: "bg-[#2E9E5B]/[0.13] text-[#2E9E5B]",
    warning: "bg-[#FFAD2D]/[0.16] text-[#B87A0A]",
    danger: "bg-[#E0442F]/[0.13] text-[#E0442F]",
  };
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/10">
        <img src={icon} alt="" className="h-4 w-4 invert" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-white/50">{subtitle}</p>
      </div>
      <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${colorMap[statusColor]}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status}
      </span>
    </div>
  );
}

export function LandingFeatures({ dict }: { dict: LandingDictionary["features"] }) {
  return (
    <section id="funcionalidades" className="bg-white px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto max-w-[1160px]">
        <div className="flex max-w-[620px] flex-col gap-3.5">
          <Badge>{dict.badge}</Badge>
          <h2 className="font-[family-name:var(--font-landing-heading)] text-3xl font-bold leading-tight tracking-tight text-[#101014] sm:text-[36.8px]">
            {dict.title}
          </h2>
          <p className="text-base leading-relaxed text-[#35363C] sm:text-[16.3px]">{dict.subtitle}</p>
        </div>

        <div className="mt-10 flex flex-col gap-5">
          {/* Card 1 - green */}
          <div className="grid grid-cols-1 items-center gap-10 rounded-[32px] bg-[#43F3AF] p-6 sm:p-12 md:grid-cols-2">
            <div className="rounded-[22px] bg-white p-5 shadow-lg">
              <p className="mb-1 text-sm font-bold text-[#101014] opacity-85">{dict.card1.panelTitle}</p>
              <div className="mt-4">
                <ComponentRow icon="/landing/icons/shock.svg" title={dict.card1.row1Title} subtitle={dict.card1.row1Sub} />
                <ComponentRow icon="/landing/icons/disc.svg" title={dict.card1.row2Title} subtitle={dict.card1.row2Sub} />
                <ComponentRow icon="/landing/icons/chain.svg" title={dict.card1.row3Title} subtitle={dict.card1.row3Sub} last />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <img src="/landing/icons/wrench-mountain.svg" alt="" className="h-8 w-9" />
              <h3 className="font-[family-name:var(--font-landing-heading)] text-2xl font-bold leading-snug text-[#101014] sm:text-[28px]">
                {dict.card1.heading}
              </h3>
              <p className="text-[15px] leading-relaxed text-[#101014]/85">{dict.card1.body}</p>
            </div>
          </div>

          {/* Card 2 - dark */}
          <div className="grid grid-cols-1 items-center gap-10 rounded-[32px] bg-[#101014] p-6 sm:p-12 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <img src="/landing/icons/bell.svg" alt="" className="h-8 w-7" />
              <h3 className="font-[family-name:var(--font-landing-heading)] text-2xl font-bold leading-snug text-white sm:text-[28px]">
                {dict.card2.heading}
              </h3>
              <p className="max-w-[400px] text-[15px] leading-relaxed text-white/85">{dict.card2.body}</p>
            </div>
            <div className="rounded-[22px] bg-white/[0.06] p-5">
              <p className="mb-1 text-sm font-bold text-white/60">{dict.card2.panelTitle}</p>
              <div className="mt-3 divide-y divide-white/10">
                <AlertRow
                  icon="/landing/icons/tire.svg"
                  title={dict.card2.alert1Title}
                  subtitle={dict.card2.alert1Sub}
                  status={dict.card2.alert1Status}
                  statusColor="success"
                />
                <AlertRow
                  icon="/landing/icons/chain.svg"
                  title={dict.card2.alert2Title}
                  subtitle={dict.card2.alert2Sub}
                  status={dict.card2.alert2Status}
                  statusColor="warning"
                />
                <AlertRow
                  icon="/landing/icons/disc.svg"
                  title={dict.card2.alert3Title}
                  subtitle={dict.card2.alert3Sub}
                  status={dict.card2.alert3Status}
                  statusColor="danger"
                />
              </div>
            </div>
          </div>

          {/* Card 3 - light. The phone runs off the bottom edge and is cut by
              it. It has to overflow to be cut: the card is as tall as its
              tallest child, so a bigger phone would simply make a bigger card.
              The negative margin shortens the layout box without shortening the
              image, and `overflow-hidden` does the cutting.

              Only from md, which is where the two columns appear. Stacked, the
              order is image-then-text, and a picture sliced through the middle
              of the card would read as a loading fault rather than a crop. */}
          <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[32px] border border-[#E9EBF6] bg-[#E9EBF6] p-6 pb-0 sm:p-12 sm:pb-0 md:h-[446px] md:grid-cols-2 md:pb-12">
            {/* The phone is always out of flow, which is what lets it be cut:
                a grid row is as tall as its tallest item, so in flow it would
                stretch the row to its own 600-odd pixels and there would be
                nothing to cut it. Stacked, this column carries a height of its
                own and clips; from md it fills the card's fixed height and the
                card does the clipping, so the crop follows the rounded corner.

                Stacked, it reads text first and picture underneath, so the
                column is ordered last below md — the crop then lands on the
                card's bottom edge rather than mid-card. */}
            <div className="relative order-last h-[360px] overflow-hidden md:order-none md:h-full md:overflow-visible">
              <img
                src="/landing/images/history-phone.webp"
                alt=""
                className="absolute top-6 left-1/2 block w-full max-w-[240px] -translate-x-1/2"
              />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-[family-name:var(--font-landing-heading)] text-2xl font-bold leading-snug text-[#101014] sm:text-[28px]">
                {dict.card3.heading}
              </h3>
              <p className="text-[15px] leading-relaxed text-[#35363C]">{dict.card3.body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
