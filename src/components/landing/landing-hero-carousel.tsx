"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { LandingDictionary } from "@/components/landing/i18n/en";

type HeroDictionary = LandingDictionary["hero"];

/**
 * Photo, icons and card placement per slide; the copy comes from the dictionary,
 * matched by index. Placement is per bike because each frame puts its wheels,
 * head tube and cranks somewhere different, and the cards sit on top of them.
 * The base classes cover the stacked layout (whole bike visible); the `xl:`
 * ones cover the desktop layout, where the bike is bigger and cropped at the
 * card's right edge.
 */
const BIKES = [
  {
    image: "/landing/images/hero-bike-enduro.webp",
    icon: "/landing/icons/bike-enduro.svg",
    summary: "left-[5%] top-[6%] xl:left-[36%] xl:top-[8%]",
    strava: "right-[5%] top-[10%] xl:right-[4%] xl:top-[8%]",
    bell: "left-[26%] top-[32%] xl:left-[62%] xl:top-[26%]",
    badge: { tone: "amber" as const, position: "left-[44%] top-[68%] xl:left-[40%] xl:top-[58%]" },
    metrics: [
      { icon: "/landing/icons/fork.svg", position: "left-[5%] top-[56%] xl:left-[13%] xl:top-[46%]" },
      {
        icon: "/landing/icons/chain.svg",
        position: "right-[5%] top-[72%] xl:left-[44%] xl:right-auto xl:top-[72%]",
      },
    ],
  },
  {
    image: "/landing/images/hero-bike-road.webp",
    icon: "/landing/icons/bike-road.svg",
    summary: "left-[5%] top-[6%] xl:left-[30%] xl:top-[12%]",
    strava: "right-[5%] top-[10%] xl:right-[4%] xl:top-[10%]",
    bell: "left-[26%] top-[32%] xl:left-[34%] xl:top-[40%]",
    badge: null,
    metrics: [
      { icon: "/landing/icons/wheels.svg", position: "left-[5%] top-[56%] xl:left-[38%] xl:top-[62%]" },
    ],
  },
  {
    image: "/landing/images/hero-bike-xc.webp",
    icon: "/landing/icons/bike-xc.svg",
    summary: "left-[5%] top-[6%] xl:left-[40%] xl:top-[14%]",
    strava: "right-[5%] top-[10%] xl:left-[26%] xl:right-auto xl:top-[32%]",
    bell: "left-[26%] top-[32%] xl:left-[38%] xl:top-[46%]",
    badge: { tone: "dark" as const, position: "left-[44%] top-[68%] xl:left-[34%] xl:top-[56%]" },
    metrics: [
      {
        icon: "/landing/icons/brake-pads.svg",
        position: "left-[5%] top-[56%] xl:left-[28%] xl:top-[70%]",
      },
    ],
  },
];

const ROTATE_MS = 5000;
/** Half the photo crossfade: the cards are blank at this point, so their text can swap. */
const CARD_SWAP_MS = 350;

export function LandingHeroCarousel({ dict }: { dict: HeroDictionary }) {
  // `leaving` is the photo on its way out. Keeping it lets every slide exit left
  // and enter from the right — including the wrap from the last back to the first,
  // which would otherwise travel backwards and give the loop away.
  const [{ index, leaving }, setSlide] = useState<{ index: number; leaving: number | null }>({
    index: 0,
    leaving: null,
  });
  const [cardIndex, setCardIndex] = useState(0);

  const goTo = (next: number) =>
    setSlide((s) => (s.index === next ? s : { index: next, leaving: s.index }));

  // Chained timeout rather than an interval: selecting a dot changes `index`,
  // which restarts the wait so a manual pick gets a full turn on screen.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => goTo((index + 1) % BIKES.length), ROTATE_MS);
    return () => clearTimeout(id);
  }, [index]);

  // Photos dissolve into each other, but two sets of cards dissolving would show
  // one card's text through the other. A single set fades out and back in instead.
  useEffect(() => {
    if (cardIndex === index) return;
    const id = setTimeout(() => setCardIndex(index), CARD_SWAP_MS);
    return () => clearTimeout(id);
  }, [index, cardIndex]);

  const bike = BIKES[cardIndex];
  const slide = dict.slides[cardIndex];
  const cardsVisible = cardIndex === index;

  return (
    <div className="flex h-full flex-col items-center xl:pb-8">
      {/* Taller than the photo until the desktop layout kicks in: object-contain
          then leaves room above and below for the cards instead of stacking them on the bike.
          From xl it fills the card's height and object-cover crops the rear wheel off the edge. */}
      <div className="relative aspect-[8/7] w-full xl:aspect-auto xl:min-h-0 xl:flex-1">
        {BIKES.map((b, i) => {
          // Everything that isn't moving waits off-screen to the right, and gets
          // there without a transition — otherwise the slide that just left would
          // sweep back across the frame on its way to the queue.
          const moving = i === index || i === leaving;
          // A short travel on purpose: the card clips its overflow, so a full-width
          // slide would show each bike sliced at the edge on its way in and out.
          // At 12% the photo is nearly in place by the time it is opaque enough to read.
          const placement =
            i === index
              ? "translate-x-0 opacity-100"
              : i === leaving
                ? "-translate-x-[12%] opacity-0"
                : "translate-x-[12%] opacity-0";

          return (
            <Image
              key={b.image}
              src={b.image}
              alt={i === index ? dict.slides[i].alt : ""}
              fill
              // All three sit in the viewport, so the later ones would otherwise
              // compete with the first for bandwidth — and it has 5s of head start.
              priority={i === 0}
              fetchPriority={i === 0 ? "high" : "low"}
              sizes="(min-width: 1280px) 50vw, 100vw"
              className={`object-cover ease-out xl:origin-bottom-left xl:translate-y-20 xl:scale-[1.02] xl:object-cover xl:object-left ${
                moving
                  ? // `translate`, not `transform`: Tailwind v4 sets the individual property.
                    "transition-[translate,opacity] duration-700 motion-reduce:transition-none"
                  : "transition-none"
              } ${placement}`}
            />
          );
        })}

        <div
          className={`absolute inset-0 transition-opacity duration-300 ease-out ${
            cardsVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Bike summary */}
          <div
            className={`absolute flex flex-col gap-1.5 rounded-[12px] bg-white p-2.5 shadow-lg sm:gap-2 sm:rounded-[15px] sm:p-3.5 ${bike.summary}`}
          >
            <img src={bike.icon} alt="" className="h-4 w-auto sm:h-6" />
            <div>
              <p className="text-[10px] font-bold leading-tight text-[#101014] sm:text-[13px]">
                {slide.name}
              </p>
              <p className="text-[9px] leading-tight text-[#8A8D93] sm:text-[11px]">{slide.stats}</p>
            </div>
          </div>

          {/* Strava */}
          <div
            className={`absolute flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-2.5 shadow-lg sm:gap-2 sm:py-1.5 sm:pl-1.5 sm:pr-4 ${bike.strava}`}
          >
            <img src="/landing/icons/strava.svg" alt="" className="h-4 w-4 sm:h-6 sm:w-6" />
            <span className="whitespace-nowrap text-[10px] font-bold text-[#101014] sm:text-[13px]">
              {dict.strava}
            </span>
          </div>

          {/* Alert */}
          <span
            className={`absolute flex items-center justify-center rounded-[8px] bg-white p-1.5 shadow-lg sm:rounded-[10px] sm:p-2.5 ${bike.bell}`}
          >
            <img src="/landing/icons/bell.svg" alt="" className="h-3 w-3 brightness-0 sm:h-4 sm:w-4" />
          </span>

          {/* Tools / sync */}
          {bike.badge && (
            <span
              className={`absolute flex items-center justify-center rounded-[8px] p-1.5 shadow-lg sm:rounded-[12px] sm:p-2.5 ${
                bike.badge.tone === "amber" ? "bg-[#FFAD2D]" : "bg-[#101014]"
              } ${bike.badge.position}`}
            >
              {bike.badge.tone === "amber" ? (
                <img
                  src="/landing/icons/wrench-mountain.svg"
                  alt=""
                  className="h-3 w-3 brightness-0 sm:h-4 sm:w-4"
                />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3 w-3 text-white sm:h-4 sm:w-4">
                  <path
                    d="M20.5 12a8.5 8.5 0 1 1-2.49-6.01M20.5 4.5V10H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          )}

          {/* One card per tracked interval on this bike */}
          {bike.metrics.map((metric, i) => {
            const value = slide.metrics[i];
            if (!value) return null;
            const healthy = value.percent >= 25;

            return (
              <div
                key={metric.icon}
                className={`absolute rounded-[12px] bg-white p-2 shadow-lg sm:rounded-[15px] sm:p-3 ${metric.position}`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <img src={metric.icon} alt="" className="hidden h-5 w-5 shrink-0 sm:block" />
                  <p className="flex-1 whitespace-nowrap text-[10px] font-bold leading-tight text-[#101014] sm:text-[13px]">
                    {value.label}
                  </p>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold text-[#101014] sm:px-2 sm:text-[11px] ${
                      healthy ? "bg-[#43F3AF]" : "bg-[#FFAD2D]"
                    }`}
                  >
                    {value.percent}%
                  </span>
                </div>
                <div className="mt-1.5 h-[3px] w-full rounded-full bg-[#101014]/10 sm:mt-2">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      healthy ? "bg-[#43F3AF]" : "bg-[#FFAD2D]"
                    }`}
                    style={{ width: `${value.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {BIKES.map((b, i) => (
          <button
            key={b.image}
            type="button"
            aria-label={dict.slideLabel.replace("{n}", String(i + 1))}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-[#101014]" : "w-2 bg-[#101014]/25 hover:bg-[#101014]/45"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
