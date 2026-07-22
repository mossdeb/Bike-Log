"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

/** True once the client has hydrated. Avoids a hydration mismatch, since
 * resolvedTheme is only known after mount (the server can't know the
 * visitor's OS/localStorage preference). */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-1">
      <Button
        type="button"
        size="icon"
        variant={mounted && resolvedTheme === "light" ? "default" : "ghost"}
        className="h-7 w-7 rounded-full"
        aria-label="Light theme"
        onClick={() => setTheme("light")}
      >
        <Sun className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant={mounted && resolvedTheme === "dark" ? "default" : "ghost"}
        className="h-7 w-7 rounded-full"
        aria-label="Dark theme"
        onClick={() => setTheme("dark")}
      >
        <Moon className="size-3.5" />
      </Button>
    </div>
  );
}
