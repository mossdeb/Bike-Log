"use client";

import { cn } from "@/lib/utils";
import { useIsBikeDetailPage } from "@/components/header-back-button";

/** On a bike's detail page, mobile merges the header into the page's own
 * card below it (white bg, rounded top corners only, no gap) — matching
 * the approved mobile mockup. Desktop keeps the plain header unchanged. */
export function AppHeader({ children }: { children: React.ReactNode }) {
  const isBikeDetail = useIsBikeDetailPage();

  return (
    <header
      className={cn(
        "relative flex items-center justify-center gap-3 px-6 py-5 sm:justify-end",
        isBikeDetail && "bg-card sm:bg-transparent"
      )}
    >
      {children}
    </header>
  );
}
