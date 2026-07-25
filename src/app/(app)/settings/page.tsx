import { createClient } from "@/lib/supabase/server";
import { getDictionary, localeFromMetadata } from "@/lib/i18n";
import { GoogleIcon } from "@/components/google-icon";
import { StravaIcon } from "@/components/strava-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import { ThemeSelect } from "@/components/theme-select";
import { PreferencesForm } from "@/components/preferences-form";
import { NotificationsForm } from "@/components/notifications-form";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { BillingSection } from "@/components/billing-section";
import { InstallAppButton } from "@/components/install-app-button";
import { getInitials } from "@/lib/initials";
import { updateFullName, deleteAccount } from "@/lib/actions/settings";
import { connectStrava, disconnectStrava } from "@/lib/actions/strava";
import { getUserSubscription } from "@/lib/subscription";

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

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const email = (user?.email as string) ?? "";
  const name = user?.user_metadata?.full_name as string | undefined;
  const distanceUnit = (user?.user_metadata?.distance_unit as string) ?? "km";
  const notificationPrefs = {
    dueSoon: (user?.user_metadata?.notify_due_soon as boolean) ?? true,
    overdue: (user?.user_metadata?.notify_overdue as boolean) ?? true,
    weeklySummary: (user?.user_metadata?.notify_weekly_summary as boolean) ?? false,
  };
  const providers = (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const isGoogleUser = providers.includes("google");

  const locale = localeFromMetadata(user?.user_metadata);
  const dict = getDictionary(locale);

  const { data: stravaConnection } = user?.sub
    ? await supabase.from("strava_connections").select("user_id").eq("user_id", user.sub as string).maybeSingle()
    : { data: null };
  const isStravaConnected = !!stravaConnection;
  const stravaError = error === "strava-connection-failed" ? dict.settings.strava.connectionFailed : error;
  const subscription = user?.sub
    ? await getUserSubscription(user.sub as string)
    : { plan: "free" as const, status: "active" as const, currentPeriodEnd: null, cancelAtPeriodEnd: false };

  return (
    <div className="pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">{dict.settings.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.settings.subtitle}</p>
      </div>

      <FormError message={stravaError} />

      <div className="flex max-w-[720px] flex-col gap-4">
        <SettingsSection title={dict.settings.profile.title} description={dict.settings.profile.description}>
          <div className="mb-5 flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-indigo font-display text-lg font-bold text-indigo-foreground">
              {getInitials(name, email)}
            </span>
            <div>
              <p className="text-sm font-bold">{name || email}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <form key={name} action={updateFullName}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full-name">{dict.settings.profile.fullName}</Label>
                <Input id="full-name" name="full-name" defaultValue={name ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-email">{dict.settings.profile.email}</Label>
                <Input id="settings-email" name="email" defaultValue={email} disabled />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button type="submit">{dict.common.save}</Button>
            </div>
          </form>
        </SettingsSection>

        <SettingsSection title={dict.settings.billing.title} description={dict.settings.billing.description}>
          <BillingSection subscription={subscription} dict={dict.settings.billing} cancelLabel={dict.common.cancel} />
        </SettingsSection>

        <SettingsSection
          title={dict.settings.notifications.title}
          description={dict.settings.notifications.description}
        >
          <NotificationsForm prefs={notificationPrefs} dict={dict.settings.notifications} />
        </SettingsSection>

        <SettingsSection
          title={dict.settings.preferences.title}
          description={dict.settings.preferences.description}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PreferencesForm
              distanceUnit={distanceUnit}
              language={locale}
              prefs={dict.settings.preferences}
              selectClassName={selectClassName}
            />
            <div className="space-y-1.5">
              <Label htmlFor="theme-preference">{dict.settings.preferences.theme}</Label>
              <ThemeSelect prefs={dict.settings.preferences} className={selectClassName} />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title={dict.settings.connectedAccounts.title}
          description={dict.settings.connectedAccounts.description}
        >
          <div className="flex items-center gap-3 rounded-sm bg-muted px-3.5 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-inset ring-border">
              <GoogleIcon className="size-4" />
            </span>
            <span className="text-sm font-semibold">{dict.settings.connectedAccounts.google}</span>
            {isGoogleUser && (
              <span className="ml-auto shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                {dict.settings.connectedAccounts.connected}
              </span>
            )}
          </div>
        </SettingsSection>

        <SettingsSection title={dict.settings.strava.title} description={dict.settings.strava.description}>
          <div className="flex items-center gap-3 rounded-sm bg-muted px-3.5 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-inset ring-border">
              <StravaIcon className="size-4" />
            </span>
            <span className="text-sm font-semibold">{dict.settings.strava.strava}</span>
            {isStravaConnected ? (
              <>
                <span className="ml-auto shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  {dict.settings.strava.connected}
                </span>
                <form action={disconnectStrava}>
                  <Button type="submit" variant="outline" size="sm">
                    {dict.settings.strava.disconnect}
                  </Button>
                </form>
              </>
            ) : (
              <form action={connectStrava} className="ml-auto">
                <Button type="submit" variant="outline" size="sm">
                  {dict.settings.strava.connect}
                </Button>
              </form>
            )}
          </div>
        </SettingsSection>

        <SettingsSection title={dict.settings.installApp.title} description={dict.settings.installApp.description}>
          <InstallAppButton
            installButtonLabel={dict.settings.installApp.installButton}
            installedLabel={dict.settings.installApp.installed}
            iosInstructions={dict.settings.installApp.iosInstructions}
          />
        </SettingsSection>

        <SettingsSection
          title={dict.settings.dangerZone.title}
          description={dict.settings.dangerZone.description}
        >
          <DeleteAccountButton
            action={deleteAccount}
            email={email}
            title={dict.settings.dangerZone.confirmTitle}
            description={dict.settings.dangerZone.confirmDescription}
            confirmHint={dict.settings.dangerZone.confirmHint(email)}
            confirmLabel={dict.settings.dangerZone.confirmButton}
            triggerLabel={dict.settings.dangerZone.deleteAccount}
            cancelLabel={dict.settings.dangerZone.cancel}
          />
        </SettingsSection>
      </div>
    </div>
  );
}
