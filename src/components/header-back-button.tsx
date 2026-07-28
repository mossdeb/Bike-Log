"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Matches a bike's detail page (not /bikes, /bikes/new, or nested
 * edit/component routes) — the only page with a merged header card. */
const BIKE_DETAIL_RE = /^\/bikes\/(?!new$)[^/]+$/;

export function useIsBikeDetailPage() {
  const pathname = usePathname();
  return BIKE_DETAIL_RE.test(pathname);
}

/** Shows a back-to-list chevron in the app header, only on a bike's
 * detail page. */
export function HeaderBackButton({ className }: { className?: string }) {
  const isBikeDetail = useIsBikeDetailPage();

  if (!isBikeDetail) return null;

  return (
    <Link
      href="/bikes"
      aria-label="Bikes"
      className={cn(
        "absolute top-1/2 left-6 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-input text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground",
        className
      )}
    >
      <ChevronLeft className="size-4" />
    </Link>
  );
}
