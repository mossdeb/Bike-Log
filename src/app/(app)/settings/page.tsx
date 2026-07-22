import { createClient } from "@/lib/supabase/server";
import { GoogleIcon } from "@/components/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/initials";

const selectClassName =
  "flex h-8 w-full items-center rounded-sm border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-card p-6">
      <h3 className="font-display font-bold">{title}</h3>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}

function ToggleRow({ label, sub, defaultChecked }: { label: string; sub: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-3.5 first:border-t-0 first:pt-0">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </div>
      <label className="relative inline-flex h-6 w-[42px] shrink-0 cursor-pointer items-center">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full border border-input bg-muted transition-colors peer-checked:border-transparent peer-checked:bg-primary" />
        <span className="absolute left-0.5 size-[18px] rounded-full bg-white shadow transition-transform peer-checked:translate-x-[18px]" />
      </label>
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const email = (user?.email as string) ?? "";
  const name = user?.user_metadata?.full_name as string | undefined;
  const providers = (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const isGoogleUser = providers.includes("google");

  return (
    <div className="pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="flex max-w-[720px] flex-col gap-4">
        <SettingsSection title="Profile" description="This information is only visible to you.">
          <div className="mb-5 flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-indigo font-display text-lg font-bold text-indigo-foreground">
              {getInitials(name, email)}
            </span>
            <div>
              <p className="text-sm font-bold">{name || email}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="full-name">Full name</Label>
              <Input id="full-name" name="full-name" defaultValue={name ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" name="email" defaultValue={email} disabled />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="button">Save changes</Button>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Email notifications"
          description="Choose when BikeLog should email you about upcoming maintenance."
        >
          <ToggleRow
            label="Service due soon"
            sub={'Get an email when a component enters its "due soon" window.'}
            defaultChecked
          />
          <ToggleRow
            label="Service overdue"
            sub="Get an email as soon as a component becomes overdue."
            defaultChecked
          />
          <ToggleRow label="Weekly summary" sub="A weekly digest of your fleet's maintenance status." />
        </SettingsSection>

        <SettingsSection title="Preferences" description="Units and appearance.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="distance-unit">Distance unit</Label>
              <select id="distance-unit" name="distance-unit" defaultValue="km" className={selectClassName}>
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="theme-preference">Theme</Label>
              <select id="theme-preference" name="theme-preference" defaultValue="system" className={selectClassName}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Connected accounts" description="Sign-in methods linked to your account.">
          <div className="flex items-center gap-3 rounded-sm bg-muted px-3.5 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-inset ring-border">
              <GoogleIcon className="size-4" />
            </span>
            <span className="text-sm font-semibold">Google</span>
            {isGoogleUser && (
              <span className="ml-auto shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                Connected
              </span>
            )}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Danger zone"
          description="Permanently delete your account and all logged maintenance data."
        >
          <Button type="button" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
            Delete account
          </Button>
        </SettingsSection>
      </div>
    </div>
  );
}
