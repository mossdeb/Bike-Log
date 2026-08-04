"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToastManager } from "@/components/ui/toast"

/** Shared by the button that opens the pending toast and this component, which
 * replaces it with the outcome — adding under an existing id updates that
 * toast in place instead of stacking a second one. */
export const STRAVA_SYNC_TOAST_ID = "strava-sync"

/** Fires a toast for the manual Strava sync button's result (redirected back
 * as a query param since the trigger is a plain server-action form, not a
 * client fetch) and strips the param so a refresh doesn't repeat it. */
export function StravaSyncToast({ message, isError }: { message: string; isError: boolean }) {
  const toastManager = useToastManager()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Fixed id: React StrictMode double-invokes effects in dev, and without
    // this the second call would add a duplicate toast instead of updating
    // the first one in place.
    toastManager.add({ id: STRAVA_SYNC_TOAST_ID, description: message, type: isError ? "error" : "success" })
    router.replace(pathname)
    // Runs once when this component mounts with a result to announce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
