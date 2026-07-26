"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function StravaAthleteId({
  athleteId,
  idLabel,
  showLabel,
  hideLabel,
}: {
  athleteId: string;
  idLabel: string;
  showLabel: string;
  hideLabel: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const masked = athleteId.length > 4 ? "•".repeat(athleteId.length - 4) + athleteId.slice(-4) : athleteId;

  return (
    <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
      {idLabel} {revealed ? athleteId : masked}
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="text-muted-foreground hover:text-foreground"
        aria-label={revealed ? hideLabel : showLabel}
      >
        {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
    </span>
  );
}
