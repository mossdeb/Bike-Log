"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BikeCarousel({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length <= 1) return;

    const onScroll = () => {
      const cards = Array.from(track.children) as HTMLElement[];
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = i;
        }
      });
      setActive(closest);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [items.length]);

  return (
    <div>
      {/* -mr-5/pr-5 must match the page's own 20px mobile margin (main's
          px-5) — a wider negative margin pushes the track past the viewport
          and gives the whole page a few px of horizontal scroll. */}
      <div
        ref={trackRef}
        className="scrollbar-none -mr-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pr-5 pb-1 sm:mr-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:pr-0 sm:pb-0 lg:grid-cols-3"
      >
        {items.map((child, i) => (
          <div key={i} className="w-[97%] shrink-0 snap-start sm:w-auto sm:shrink">
            {child}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
          {items.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-4 bg-foreground" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
