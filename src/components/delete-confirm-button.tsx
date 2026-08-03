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
import { buttonVariants } from "@/components/ui/button";

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
    <AlertDialog>
      <AlertDialogTrigger className={buttonVariants({ variant: "destructive" })}>
        {triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <form action={action} className="w-full">
            <AlertDialogAction type="submit" variant="destructive" className="w-full">
              {triggerLabel}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
