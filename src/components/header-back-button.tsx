"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

/** Matches a bike's detail page or one of its components' detail pages
 * (not /bikes, /bikes/new, or nested edit/new/interventions routes) —
 * anywhere the header shows a back chevron. */
const DETAIL_PAGE_RE = /^\/bikes\/(?!new$)([^/]+)(\/components\/(?!new$)[^/]+)?$/;

/** Bike detail only — the sole page whose header merges into its own
 * card (white bg, no top corners). The component detail page reverted
 * to a normal card, so its header stays plain. */
const BIKE_DETAIL_RE = /^\/bikes\/(?!new$)[^/]+$/;

export function useIsBikeDetailPage() {
  const pathname = usePathname();
  return BIKE_DETAIL_RE.test(pathname);
}

/** Shows a back chevron in the app header, on a bike's detail page or a
 * component's detail page (going back to the bike). */
export function HeaderBackButton({ className }: { className?: string }) {
  const pathname = usePathname();
  const match = pathname.match(DETAIL_PAGE_RE);

  if (!match) return null;

  const [, bikeId, componentSegment] = match;
  const backHref = componentSegment ? `/bikes/${bikeId}` : "/bikes";

  return (
    <Link
      href={backHref}
      aria-label="Back"
      className={cn(
        "absolute top-1/2 left-5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-input text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground sm:left-6",
        className
      )}
    >
      <ChevronLeft className="size-4" />
    </Link>
  );
}

/** Icon-only edit button shown in the shared header, on mobile only — bike
 * detail and component detail pages both. Desktop keeps each page's own
 * inline edit button instead. */
export function HeaderEditButton({ className }: { className?: string }) {
  const pathname = usePathname();

  if (!DETAIL_PAGE_RE.test(pathname)) return null;

  return (
    <Link
      href={`${pathname}/edit`}
      aria-label="Edit"
      className={cn(
        "absolute top-1/2 right-5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-input text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground sm:hidden",
        className
      )}
    >
      <Pencil className="size-4" />
    </Link>
  );
}
