"use client";

import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { logout } from "@/lib/actions/auth";
import { getInitials } from "@/lib/initials";

export function UserMenu({ name, email }: { name?: string | null; email: string }) {
  const initials = getInitials(name, email);

  return (
    <Popover>
      <PopoverTrigger
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo font-display text-xs font-bold text-indigo-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label="Account"
      >
        {initials}
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <div className="mb-1.5 flex items-center gap-3 border-b border-border px-2 pt-1 pb-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo font-display text-xs font-bold text-indigo-foreground">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name || email}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-sm px-2 py-2 text-sm hover:bg-muted"
        >
          <Settings className="size-4 text-muted-foreground" />
          Settings
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
