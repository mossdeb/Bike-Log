import { LayoutDashboard, Bike } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/bikes", labelKey: "bikes", icon: Bike },
] as const;
