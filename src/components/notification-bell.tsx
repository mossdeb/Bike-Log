"use client";

import { Bell } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function NotificationBell() {
  return (
    <Popover>
      <PopoverTrigger
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <p className="px-2 pt-1 pb-2 text-sm font-semibold">Notifications</p>
        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
          You&apos;re all caught up. Nothing new to show yet.
        </div>
      </PopoverContent>
    </Popover>
  );
}
