"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { CheckCircle2Icon, AlertCircleIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitive.Provider

const useToastManager = ToastPrimitive.useToastManager

function ToastList() {
  const { toasts } = useToastManager()
  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      className={cn(
        "absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-lg bg-popover px-4 py-3.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10 [transform:translateY(calc(var(--toast-offset-y)*-1))] [transition:transform_0.4s_cubic-bezier(0.22,1,0.36,1),opacity_0.3s]",
        "data-starting-style:translate-y-3 data-starting-style:opacity-0 data-ending-style:opacity-0"
      )}
    >
      <ToastPrimitive.Content className="flex items-start gap-2.5">
        {toast.type === "error" ? (
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
        ) : (
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-health-positive" />
        )}
        <div className="min-w-0 flex-1">
          {toast.title && <ToastPrimitive.Title className="text-sm font-semibold" />}
          {toast.description && <ToastPrimitive.Description className="text-sm text-muted-foreground" />}
        </div>
        <ToastPrimitive.Close
          aria-label="Close"
          className="shrink-0 text-muted-foreground outline-none hover:text-foreground"
        >
          <XIcon className="size-3.5" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ))
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
