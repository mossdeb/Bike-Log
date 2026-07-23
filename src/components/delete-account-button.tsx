"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";

export function DeleteAccountButton({
  action,
  email,
  title,
  description,
  confirmHint,
  confirmLabel,
  triggerLabel,
  cancelLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  email: string;
  title: string;
  description: string;
  confirmHint: string;
  confirmLabel: string;
  triggerLabel: string;
  cancelLabel: string;
}) {
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) setTyped("");
      }}
    >
      <AlertDialogTrigger className={buttonVariants({ variant: "destructive" })}>
        {triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{confirmHint}</p>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name="confirm-email" value={typed} />
            <AlertDialogAction type="submit" variant="destructive" disabled={!matches}>
              {confirmLabel}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
