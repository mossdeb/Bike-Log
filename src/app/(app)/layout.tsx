import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";
import { HeaderBackButton, HeaderEditButton } from "@/components/header-back-button";
import { AppHeader } from "@/components/app-header";
import { ToastProvider, Toaster } from "@/components/ui/toast";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Defense in depth: proxy.ts already redirects unauthenticated requests,
  // but Server Components can't rely solely on that — verify again here.
  if (!user) {
    redirect("/login");
  }

  const dict = getDictionary(localeFromMetadata(user.user_metadata));

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar nav={dict.nav} />
        <div className="mx-auto flex min-w-0 w-full max-w-[1440px] flex-1 flex-col">
          <AppHeader>
            <HeaderBackButton />
            <HeaderEditButton />
            <div className="flex items-center gap-2.5 sm:hidden">
              <LogoMark className="size-8 rounded-[8px]" />
              <span className="font-display text-lg font-bold">Bikit</span>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <ThemeToggle />
              <NotificationBell notifications={dict.notifications} />
              <UserMenu name={user.user_metadata?.full_name} email={user.email as string} common={dict.common} />
            </div>
          </AppHeader>
          <main className="flex-1 px-5 pb-24 sm:px-6 sm:pb-10">{children}</main>
        </div>
        <MobileNav nav={dict.nav} />
      </div>
      <Toaster />
    </ToastProvider>
  );
}
