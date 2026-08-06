import type { Dictionary } from "@/lib/i18n/dictionaries/en";

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
