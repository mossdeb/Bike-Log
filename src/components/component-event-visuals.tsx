import { cn } from "@/lib/utils";
import { ComponentIcon } from "@/components/component-icon";
import { COMPONENT_CATEGORY_ICON } from "@/components/component-category-icon";
import type { ComponentCategory } from "@/lib/constants";

/**
 * The two marks that say "something happened to this part": the badged category
 * glyph, and a figure split into value and unit.
 *
 * They live here rather than inside the timeline because the archive list draws
 * the same card and has to draw it identically — a second copy would drift the
 * first time either is adjusted.
 */

/** The part's category glyph with a small badge over it saying what happened
 * to it. */
export function BadgedCategoryIcon({
  category,
  badge,
  badgeStyle,
}: {
  category: string | null;
  badge: React.ReactNode;
  badgeStyle: string;
}) {
  return (
    <span className="relative shrink-0">
      <ComponentIcon
        size="flat"
        icon={COMPONENT_CATEGORY_ICON[category as ComponentCategory]}
        className="size-11"
      />
      {/* Ringed in the card's own colour so the badge reads as sitting on top
          of the icon rather than merging into its outline. */}
      <span
        className={cn(
          "absolute -right-1 -bottom-1 flex size-[22px] items-center justify-center rounded-full ring-2 ring-card",
          badgeStyle
        )}
      >
        {badge}
      </span>
    </span>
  );
}

/**
 * A figure with its unit set back, so a column of them reads as numbers first.
 *
 * Both formatters emit "<value> <unit>" and the value itself can hold spaces
 * (a Portuguese "3 302"), so the split is on the last space, not the first.
 */
export function Measure({ text }: { text: string }) {
  const at = text.lastIndexOf(" ");
  if (at === -1) return <p className="text-[15px] leading-tight font-semibold">{text}</p>;
  return (
    <p className="text-[15px] leading-tight whitespace-nowrap">
      <span className="font-semibold">{text.slice(0, at)}</span>{" "}
      <span className="text-muted-foreground">{text.slice(at + 1)}</span>
    </p>
  );
}
