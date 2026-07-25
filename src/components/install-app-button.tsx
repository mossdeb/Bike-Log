"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function subscribeStandalone(callback: () => void) {
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", callback);
  window.addEventListener("appinstalled", callback);
  return () => {
    mql.removeEventListener("change", callback);
    window.removeEventListener("appinstalled", callback);
  };
}

const emptySubscribe = () => () => {};

export function InstallAppButton({
  installButtonLabel,
  installedLabel,
  iosInstructions,
}: {
  installButtonLabel: string;
  installedLabel: string;
  iosInstructions: string;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  // Same hydration-safety approach as AppSidebar: the server can't know
  // display-mode/user-agent, so these fall back to "not installed"/"not
  // iOS" until the client mounts and reports the real value.
  const installed = useSyncExternalStore(subscribeStandalone, isStandalone, () => false);
  const ios = useSyncExternalStore(
    emptySubscribe,
    () => /iphone|ipad|ipod/i.test(navigator.userAgent),
    () => false
  );

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return <span className="text-sm text-muted-foreground">{installedLabel}</span>;
  }

  if (deferredPrompt) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={async () => {
          await deferredPrompt.prompt();
          setDeferredPrompt(null);
        }}
      >
        {installButtonLabel}
      </Button>
    );
  }

  if (ios) {
    return (
      <div className="space-y-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setShowIosHint((v) => !v)}>
          {installButtonLabel}
        </Button>
        {showIosHint && <p className="text-xs text-muted-foreground">{iosInstructions}</p>}
      </div>
    );
  }

  return null;
}
