"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const emptySubscribe = () => () => {};

/** Same hydration-safety pattern as ThemeToggle: the server can't know the
 * visitor's stored theme, so render "system" until the client mounts. */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeSelect({
  prefs,
  className,
}: {
  prefs: Dictionary["settings"]["preferences"];
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <select
      value={mounted ? theme : "system"}
      onChange={(e) => setTheme(e.target.value)}
      className={className}
    >
      <option value="system">{prefs.themeSystem}</option>
      <option value="light">{prefs.themeLight}</option>
      <option value="dark">{prefs.themeDark}</option>
    </select>
  );
}
