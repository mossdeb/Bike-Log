"use client";

import { useState, useTransition, type ReactNode } from "react";
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
import type { BillingInterval, PaidPlan } from "@/lib/plans";

export function SwitchPlanButton({
  action,
  plan,
  interval,
  triggerLabel,
  triggerClassName,
  title,
  description,
  confirmLabel,
  cancelLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  plan: PaidPlan;
  /** Omitted, the server keeps whichever period the subscription already bills
   * on; named, it moves to that one along with the plan. */
  interval?: BillingInterval;
  triggerLabel: ReactNode;
  triggerClassName?: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    const formData = new FormData();
    formData.set("plan", plan);
    if (interval) formData.set("interval", interval);
    startTransition(async () => {
      await action(formData);
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className={triggerClassName ?? buttonVariants({ variant: "outline" })}>
        {triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction type="button" onClick={handleConfirm} disabled={isPending}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
