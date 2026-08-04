"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // updateViaCache: "none" so a deploy that changes the push handling
      // reaches devices on the next visit instead of whenever the HTTP cache
      // happens to let go of the old script.
      navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {});
    }
  }, []);

  return null;
}
