"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

type Variant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

/**
 * A control that asks before it acts.
 *
 * The trigger is given rather than assumed, because the same confirmation hangs
 * off a full-width button in a form's danger zone and off a 40px circle beside
 * a page title.
 */
export function ConfirmActionButton({
  action,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "destructive",
  triggerContent,
  triggerClassName,
  triggerAriaLabel,
}: {
  action: () => Promise<void>;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: Variant;
  triggerContent: React.ReactNode;
  /** Defaults to the button styling for `variant`. */
  triggerClassName?: string;
  triggerAriaLabel?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        aria-label={triggerAriaLabel}
        className={triggerClassName ?? buttonVariants({ variant })}
      >
        {triggerContent}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <form action={action} className="w-full">
            <AlertDialogAction type="submit" variant={variant} className="w-full">
              {confirmLabel}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteConfirmButton({
  action,
  title,
  description,
  triggerLabel = "Delete",
  cancelLabel = "Cancel",
}: {
  action: () => Promise<void>;
  title: string;
  description: string;
  triggerLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <ConfirmActionButton
      action={action}
      title={title}
      description={description}
      confirmLabel={triggerLabel}
      cancelLabel={cancelLabel}
      variant="destructive"
      triggerContent={triggerLabel}
    />
  );
}
