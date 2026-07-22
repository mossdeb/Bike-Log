import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

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
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 px-6 py-5">
          <ThemeToggle />
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.email as string}
          </span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </header>
        <main className="flex-1 px-6 pb-10">{children}</main>
      </div>
    </div>
  );
}
