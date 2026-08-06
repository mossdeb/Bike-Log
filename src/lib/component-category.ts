import type { Dictionary } from "@/lib/i18n/dictionaries/en";
// Relative, not the "@/" alias: there is no vitest.config.ts, so the alias
// does not resolve under the test runner. The Dictionary import above can keep
// the alias because it is type-only and compiles away.
import { COMPONENT_CATEGORIES } from "./constants";

/**
 * The reader-facing name of a component category.
 *
 * The stored value is always the English string from COMPONENT_CATEGORIES —
 * it's what `components.category` holds, what COMPONENT_CATEGORY_ICON is keyed
 * off, and what `deriveComponentName` can fall back to. Translating it in the
 * database would break all three for the sake of a label, so only the display
 * is translated and the stored value never moves.
 *
 * An unknown category — a row written before the list changed — comes back as
 * itself rather than blank, the same way ComponentIcon falls back to its
 * generic glyph.
 */
export function categoryLabel(dict: Dictionary, category: string | null | undefined): string | null {
  if (!category) return null;
  const labels: Record<string, string | undefined> = dict.components.categories;
  return labels[category] ?? category;
}

const CATEGORY_ORDER = new Map<string, number>(
  COMPONENT_CATEGORIES.map((category, index) => [category, index])
);

/**
 * Where a category sits in a list of components.
 *
 * The rank comes from the position in COMPONENT_CATEGORIES, not from the
 * label. Sorting on the label would order the page differently in English and
 * in Portuguese, and the stored value is the only part of a category that
 * doesn't move between the two. It also means the cards come out in the order
 * the create form offers them, which is one less arrangement to learn.
 *
 * A category the list no longer has — or none at all — sorts last. An unknown
 * value has to land somewhere, and the end is where it does least harm.
 */
function categoryRank(category: string | null | undefined): number {
  if (!category) return Number.MAX_SAFE_INTEGER;
  return CATEGORY_ORDER.get(category) ?? Number.MAX_SAFE_INTEGER;
}

/**
 * Comparator for a list of components, grouping them by category.
 *
 * Deliberately says nothing about what happens inside a category: Array.sort
 * is stable, so whatever order the caller arrives with is the order that
 * survives there. The bike page arrives sorted by created_at, which keeps two
 * tyres in the order they were fitted.
 */
export function compareByCategory(
  a: { category: string | null },
  b: { category: string | null }
): number {
  return categoryRank(a.category) - categoryRank(b.category);
}
