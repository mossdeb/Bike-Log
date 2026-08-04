import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * The app's dropdowns: a plain <select> with the browser's arrow suppressed
 * and ours drawn on top. Chrome pins its built-in arrow to the right edge and
 * ignores padding-right entirely, so drawing the chevron ourselves is the only
 * way to control the gap — 20px here, like the rest of the app's edge spacing.
 *
 * Classes that place the field itself (width, margins) go on
 * `wrapperClassName`: inside the wrapper the select is always full-width, and
 * the wrapper is what the chevron is positioned against.
 */
function NativeSelect({
  className,
  wrapperClassName,
  children,
  ...props
}: React.ComponentProps<"select"> & { wrapperClassName?: string }) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        data-slot="native-select"
        className={cn(
          "flex h-[48px] w-full appearance-none items-center rounded-sm border border-input bg-transparent pr-11 pl-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-5 size-4 -translate-y-1/2 text-foreground" />
    </div>
  )
}

export { NativeSelect }
