import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Defense in depth: proxy.ts already redirects unauthenticated requests,
  // but Server Components can't rely solely on that — verify again here.
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="mx-auto flex min-w-0 w-full max-w-[1440px] flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 px-6 py-5 sm:justify-end">
          <div className="flex items-center gap-2.5 sm:hidden">
            <LogoMark className="size-8 rounded-xl" />
            <span className="font-display text-lg font-bold">BikeLog</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <UserMenu name={user.user_metadata?.full_name} email={user.email as string} />
          </div>
        </header>
        <main className="flex-1 px-6 pb-24 sm:pb-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
