"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Ban, MoreVertical, Pencil, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Everything you can do to a component that isn't logging maintenance, behind
 * one control.
 *
 * A three-dot glyph rather than the pencil it replaces: a pencil is a verb, and
 * tapping one should land in the edit form, not open a list. This is also the
 * only place the lifecycle action lives now, in both states — archiving used to
 * sit in the header while restoring sat at the foot of the card, so the same
 * action moved depending on whether the part was fitted.
 *
 * The confirmation is a sibling of the menu, not a child of it: the popup
 * unmounts as the dialog opens, and a dialog nested inside it would go with it.
 */
export function ComponentActionsMenu({
  editHref,
  editLabel,
  menuLabel,
  isArchived,
  lifecycleLabel,
  lifecycleAction,
  confirmTitle,
  confirmDescription,
  confirmLabel,
  cancelLabel,
}: {
  editHref: string;
  editLabel: string;
  menuLabel: string;
  isArchived: boolean;
  lifecycleLabel: string;
  lifecycleAction: () => Promise<void>;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel: string;
  cancelLabel: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Opening the dialog in the same tick as closing the menu does nothing: the
  // popup is still tearing down and restoring focus, and it swallows the
  // dialog. Measured — the menu closed and no confirmation appeared. So the
  // intent is parked here and acted on once the popup has actually gone.
  const wantsConfirm = useRef(false);

  const itemClass =
    "flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm hover:bg-muted";

  return (
    <>
      <Popover
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onOpenChangeComplete={(open) => {
          if (open || !wantsConfirm.current) return;
          wantsConfirm.current = false;
          setConfirmOpen(true);
        }}
      >
        <PopoverTrigger
          aria-label={menuLabel}
          // Ringed rather than bare: it inherits the circle the pencil used to
          // wear, so it still reads as a control at a glance instead of three
          // dots floating beside the title.
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-input text-muted-foreground outline-none transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <MoreVertical className="size-5" />
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2">
          <Link href={editHref} className={itemClass}>
            <Pencil className="size-4 text-muted-foreground" />
            {editLabel}
          </Link>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              wantsConfirm.current = true;
              setMenuOpen(false);
            }}
          >
            {isArchived ? (
              <RotateCcw className="size-4 text-muted-foreground" />
            ) : (
              <Ban className="size-4 text-muted-foreground" />
            )}
            {lifecycleLabel}
          </button>
        </PopoverContent>
      </Popover>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
            <form action={lifecycleAction} className="w-full">
              <AlertDialogAction type="submit" variant="inverted" className="w-full">
                {confirmLabel}
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
