import { Resend } from "resend";
import { getDictionary, type Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

// Resend's shared testing domain — works with just an API key, no DNS setup.
const FROM = "BikeLog <onboarding@resend.dev>";

// Constructed lazily (and only once RESEND_API_KEY exists) so the app and
// the cron route still run — just without sending — before it's configured.
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set — skipping email send.");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function wrapEmail(heading: string, bodyHtml: string, ctaLabel: string, ctaHref: string, footer: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#efefef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#101014;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <h1 style="font-size:20px;margin:0 0 16px;">${heading}</h1>
      ${bodyHtml}
      <a href="${ctaHref}" style="display:inline-block;margin-top:24px;padding:10px 22px;background:#43f3af;color:#062a20;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">${ctaLabel}</a>
      <p style="margin-top:32px;font-size:12px;color:#8a8d93;">${footer}</p>
    </div>
  </body>
</html>`;
}

/** Returns whether the email actually sent, so callers only log a episode/
 * dedupe entry for sends that really happened (e.g. not when RESEND_API_KEY
 * is unset). */
export async function sendDueSoonEmail(params: {
  to: string;
  locale: Locale;
  componentName: string;
  bikeName: string;
  dueDate: string;
  componentUrl: string;
  siteUrl: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) return false;

  const dict = getDictionary(params.locale).email;
  const html = wrapEmail(
    dict.dueSoon.heading,
    `<p style="margin:0;font-size:15px;line-height:1.5;">${dict.dueSoon.body(params.componentName, params.bikeName, formatDate(params.dueDate))}</p>`,
    dict.cta,
    `${params.siteUrl}${params.componentUrl}`,
    dict.footer
  );
  const { error } = await client.emails.send({
    from: FROM,
    to: params.to,
    subject: dict.dueSoon.subject(params.componentName),
    html,
  });
  return !error;
}

export async function sendOverdueEmail(params: {
  to: string;
  locale: Locale;
  componentName: string;
  bikeName: string;
  daysOverdue: number;
  componentUrl: string;
  siteUrl: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) return false;

  const dict = getDictionary(params.locale).email;
  const html = wrapEmail(
    dict.overdue.heading,
    `<p style="margin:0;font-size:15px;line-height:1.5;">${dict.overdue.body(params.componentName, params.bikeName, params.daysOverdue)}</p>`,
    dict.cta,
    `${params.siteUrl}${params.componentUrl}`,
    dict.footer
  );
  const { error } = await client.emails.send({
    from: FROM,
    to: params.to,
    subject: dict.overdue.subject(params.componentName),
    html,
  });
  return !error;
}

export interface WeeklySummaryItem {
  componentName: string;
  bikeName: string;
  detail: string;
  url: string;
}

export async function sendWeeklySummaryEmail(params: {
  to: string;
  locale: Locale;
  overdue: WeeklySummaryItem[];
  dueSoon: WeeklySummaryItem[];
  siteUrl: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) return false;

  const dict = getDictionary(params.locale).email;

  function renderSection(title: string, items: WeeklySummaryItem[]): string {
    if (items.length === 0) return "";
    const rows = items
      .map(
        (item) =>
          `<li style="margin-bottom:8px;"><a href="${params.siteUrl}${item.url}" style="color:#101014;text-decoration:none;font-weight:600;">${item.componentName}</a> — ${item.bikeName} <span style="color:#8a8d93;">(${item.detail})</span></li>`
      )
      .join("");
    return `<h2 style="font-size:14px;margin:20px 0 8px;">${title}</h2><ul style="margin:0;padding-left:18px;font-size:14px;">${rows}</ul>`;
  }

  const hasItems = params.overdue.length > 0 || params.dueSoon.length > 0;
  const body = hasItems
    ? `<p style="margin:0;font-size:15px;line-height:1.5;">${dict.weeklySummary.intro}</p>
       ${renderSection(dict.weeklySummary.overdueSection, params.overdue)}
       ${renderSection(dict.weeklySummary.dueSoonSection, params.dueSoon)}`
    : `<p style="margin:0;font-size:15px;line-height:1.5;">${dict.weeklySummary.noneNeedAttention}</p>`;

  const html = wrapEmail(dict.weeklySummary.heading, body, dict.cta, `${params.siteUrl}/dashboard`, dict.footer);

  const { error } = await client.emails.send({
    from: FROM,
    to: params.to,
    subject: dict.weeklySummary.subject,
    html,
  });
  return !error;
}
