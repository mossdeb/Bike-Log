"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { CheckCircle2Icon, AlertCircleIcon, LoaderCircleIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitive.Provider

const useToastManager = ToastPrimitive.useToastManager

// --emphasis is the surface that has to stand out from ordinary cards in both
// themes: near-black in light mode, and deliberately *lighter* than a card in
// dark mode. That's what the toast needs — as a popover it was white on white
// in light mode and card-coloured in dark mode, invisible either way. Staying
// dark in light mode also means the status colours below have one background
// to be legible against instead of flipping with the theme.
// The mint reads on both emphasis surfaces, but --health-critical only clears
// 3.7:1 against the lighter dark-mode one — under the 4.5:1 this text size
// needs — so the error tone hands off to --destructive, which the dark theme
// already lightens for exactly this reason.
const TONE = {
  loading: { icon: LoaderCircleIcon, className: "text-emphasis-foreground" },
  error: { icon: AlertCircleIcon, className: "text-health-critical dark:text-destructive" },
  success: { icon: CheckCircle2Icon, className: "text-health-positive" },
} as const

function ToastList() {
  const { toasts } = useToastManager()
  return toasts.map((toast) => {
    const tone = TONE[toast.type as keyof typeof TONE] ?? TONE.success
    const Icon = tone.icon
    return (
      <ToastPrimitive.Root
        key={toast.id}
        toast={toast}
        className={cn(
          "absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-lg bg-emphasis px-4 py-3.5 text-emphasis-foreground shadow-lg ring-1 ring-emphasis-foreground/15 [transform:translateY(calc(var(--toast-offset-y)*-1))] [transition:transform_0.4s_cubic-bezier(0.22,1,0.36,1),opacity_0.3s]",
          "data-starting-style:translate-y-3 data-starting-style:opacity-0 data-ending-style:opacity-0"
        )}
      >
        <ToastPrimitive.Content className="flex items-start gap-2.5">
          <Icon
            className={cn("mt-0.5 size-4 shrink-0", tone.className, toast.type === "loading" && "motion-safe:animate-spin")}
          />
          <div className="min-w-0 flex-1">
            {toast.title && <ToastPrimitive.Title className="text-sm font-semibold" />}
            {toast.description && <ToastPrimitive.Description className={cn("text-sm", tone.className)} />}
          </div>
          <ToastPrimitive.Close
            aria-label="Close"
            className="shrink-0 text-emphasis-foreground/60 outline-none hover:text-emphasis-foreground"
          >
            <XIcon className="size-3.5" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Content>
      </ToastPrimitive.Root>
    )
  })
}

function Toaster() {
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport className="fixed right-4 bottom-24 left-4 z-50 mx-auto w-auto sm:right-6 sm:bottom-6 sm:left-auto sm:w-[22.5rem]">
        <ToastList />
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

export { ToastProvider, Toaster, useToastManager }
