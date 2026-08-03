"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";

const IMAGES = ["/images/onboarding-1.jpg", "/images/onboarding-2.jpg", "/images/onboarding-3.jpg", "/images/onboarding-4.jpg"];

type Step = {
  greeting?: string;
  title: string;
  subtitle: string;
};

/** First-run product tour, shown once (gated by `user_metadata.onboarding_completed`,
 * set by the `action` server action on any dismissal). Full-screen on mobile,
 * a centered card on desktop — mirrors the mockup exactly for each.
 * `steps` arrives pre-resolved (greeting already interpolated with the name)
 * since Server Component props can't carry the dictionary's format functions
 * across to this Client Component. */
export function OnboardingDialog({
  open: initialOpen,
  steps,
  labels,
  action,
}: {
  open: boolean;
  steps: Step[];
  labels: { getStarted: string; next: string; skip: string; addFirstBike: string; addLater: string };
  action: () => Promise<void>;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function dismiss() {
    setOpen(false);
    startTransition(async () => {
      await action();
    });
  }

  function goToFirstBike() {
    setOpen(false);
    startTransition(async () => {
      await action();
      router.push("/bikes/new");
    });
  }

  const current = steps[step - 1];

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-0 z-50 overflow-hidden bg-background outline-none duration-100",
            "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[640px] sm:w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:ring-1 sm:ring-foreground/10 sm:data-open:zoom-in-95 sm:data-closed:zoom-out-95"
          )}
        >
          {/* Image is the full-bleed background for the whole card — title,
              subtitle/dots and the buttons all sit on top of it in a z-10
              overlay, so the overlap is intentional rather than accidental
              clipping. */}
          <Image
            src={IMAGES[step - 1]}
            alt=""
            fill
            sizes="(min-width: 640px) 420px, 100vw"
            className="object-cover"
            priority={step === 1}
          />
          <div className="relative z-10 flex h-full flex-col justify-between px-6 pt-12 pb-8 sm:px-8 sm:pt-8">
            <div className="text-center">
              {current.greeting ? (
                <p className="font-display text-2xl font-bold">{current.greeting}</p>
              ) : (
                <div className="mb-2 flex items-center justify-center gap-2">
                  <LogoMark className="size-8 rounded-[8px]" />
                  <span className="font-display text-lg font-bold">Bikit</span>
                </div>
              )}
              <h2 className="font-display text-2xl font-bold">{current.title}</h2>
            </div>

            <div>
              <p className="text-center text-[22px] leading-[24px] text-foreground">{current.subtitle}</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {([1, 2, 3, 4] as const).map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      n === step ? "w-6 bg-foreground" : "w-2 bg-border"
                    )}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col items-center gap-3">
                {step < 4 ? (
                  <Button
                    key="next"
                    type="button"
                    className="w-full border-transparent bg-foreground text-background hover:bg-foreground/90"
                    onClick={() => setStep((s) => ((s + 1) as 1 | 2 | 3 | 4))}
                  >
                    {step === 1 ? labels.getStarted : labels.next}
                  </Button>
                ) : (
                  <Button
                    key="final"
                    type="button"
                    className="w-full border-transparent bg-foreground text-background hover:bg-foreground/90"
                    onClick={goToFirstBike}
                  >
                    {labels.addFirstBike}
                  </Button>
                )}
                <button
                  type="button"
                  className="text-base text-foreground transition-opacity hover:opacity-70"
                  onClick={dismiss}
                >
                  {step < 4 ? labels.skip : labels.addLater}
                </button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
