import { MenuBikesIcon, MenuDashboardIcon, MenuSettingsIcon } from "@/components/menu-icons";

export const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard", icon: MenuDashboardIcon },
  { href: "/bikes", labelKey: "bikes", icon: MenuBikesIcon },
] as const;

export const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard", icon: MenuDashboardIcon, iconClassName: "size-7" },
  { href: "/bikes", labelKey: "bikes", icon: MenuBikesIcon, iconClassName: "size-[36.4px]" },
  { href: "/settings", labelKey: "settings", icon: MenuSettingsIcon, iconClassName: "size-7" },
] as const;
