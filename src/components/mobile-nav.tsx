"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function MobileNav({ nav }: { nav: Dictionary["nav"] }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-4 z-40 flex items-stretch justify-around rounded-2xl bg-sidebar text-sidebar-foreground shadow-lg sm:hidden"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      aria-label="Primary"
    >
      {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold",
              active ? "text-sidebar-primary" : "text-sidebar-foreground/60"
            )}
          >
            <Icon className="size-5" />
            {nav[labelKey]}
          </Link>
        );
      })}
    </nav>
  );
}
