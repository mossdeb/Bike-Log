/**
 * Hover surface shared by every clickable card and list row on a card.
 *
 * The light-mode value is a fixed hex rather than a token: it's a hair darker
 * than the white card, and the muted token at any opacity either vanished or
 * went too far. Dark mode keeps the token tint — #F7F7F7 there would turn the
 * card white.
 */
export const CLICKABLE_CARD_HOVER = "transition-colors hover:bg-[#F7F7F7] dark:hover:bg-muted/50";
