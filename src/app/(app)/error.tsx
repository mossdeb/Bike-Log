"use client";

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center pt-24 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <CircleAlert className="size-6 text-destructive" />
      </div>
      <h1 className="text-xl font-display font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That request didn&apos;t go through. Try again — if it keeps happening, come back later.
      </p>
      <Button type="button" onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
