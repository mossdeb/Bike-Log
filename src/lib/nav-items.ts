import { LayoutDashboard, Bike } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bikes", label: "Bikes", icon: Bike },
] as const;
