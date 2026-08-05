import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { CLICKABLE_CARD_HOVER } from "@/lib/card-styles";
import { formatDate, formatDistance, formatHours } from "@/lib/format";
import type { TimelineEvent } from "@/lib/timeline";
import { INTERVENTION_TYPE_ICON } from "@/lib/intervention-type";
import { INTERVENTION_TYPE_STYLES } from "@/components/type-badge";
import { ManufacturedIcon, PurchasedIcon, WarrantyIcon } from "@/components/timeline-icons";
import { LogoIcon } from "@/components/logo";
import { BikeIcon } from "@/components/bike-icon";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n";

function TimelineDot({ large }: { large?: boolean }) {
  return <span className={cn("shrink-0 rounded-full bg-foreground", large ? "size-3" : "size-2.5")} />;
}

function MilestonePill({
  icon,
  label,
  date,
}: {
  icon: React.ReactNode;
  label: string;
  date: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-[12px] bg-card px-5 py-3">
      <span className="flex size-6 shrink-0 items-center justify-center text-foreground">{icon}</span>
      <p className="text-sm font-semibold">{label}</p>
      <span className="ml-1 text-xs text-muted-foreground">{date}</span>
    </div>
  );
}

/** Annotates each event with the year label to show above it, whenever its
 * year differs from the previous (more recent) event's year. */
function withYearLabels(events: TimelineEvent[]): (TimelineEvent & { yearLabel: string | null })[] {
  let lastYear = String(new Date().getFullYear());
  return events.map((event) => {
    const eventYear = event.sortDate.slice(0, 4);
    const yearLabel = eventYear !== lastYear ? eventYear : null;
    lastYear = eventYear;
    return { ...event, yearLabel };
  });
}

function YearLabel({ year }: { year: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <TimelineDot />
      <span className="flex h-8 items-center rounded-[12px] bg-card px-5 text-[16px] font-bold">{year}</span>
    </div>
  );
}

function MilestoneCard({
  icon,
  label,
  subtitle,
  date,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  date: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[12px] bg-card px-8 py-6 text-center">
      <span className="flex shrink-0 items-center gap-2 text-foreground">{icon}</span>
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-base leading-tight font-semibold">{label}</p>
        {subtitle && <p className="text-sm leading-tight text-muted-foreground">{subtitle}</p>}
        <p className="text-sm leading-tight text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}

export function BikeTimeline({
  events,
  dict,
  locale,
  distanceUnit,
  bikeId,
  bikeType,
}: {
  events: TimelineEvent[];
  dict: Dictionary;
  locale: Locale;
  distanceUnit: "km" | "mi";
  bikeId: string;
  bikeType?: string | null;
}) {
  return (
    <div className="relative mx-auto max-w-xl">
      <div className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 border-l border-dashed border-foreground/30" />
      <div className="relative flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3">
          <TimelineDot large />
          <span className="rounded-[12px] bg-card px-5 py-2 text-sm font-semibold">
            {dict.bikes.detail.today}
          </span>
        </div>

        {withYearLabels(events).map((event) => {
          let content: React.ReactNode;

          if (event.kind === "intervention") {
            const Icon = INTERVENTION_TYPE_ICON[event.type];
            const stats = [
              event.componentName,
              event.kms != null ? formatDistance(event.kms, distanceUnit, locale) : null,
              event.hoursUsed != null ? formatHours(event.hoursUsed, locale) : null,
            ]
              .filter(Boolean)
              .join(" · ");
            content = (
              <div className="flex w-full flex-col items-center gap-3">
                <TimelineDot />
                <Link
                  href={`/bikes/${bikeId}/components/${event.componentId}/interventions/${event.id}/edit`}
                  className={cn("flex w-full items-center gap-4 rounded-lg bg-card p-5", CLICKABLE_CARD_HOVER)}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-[12px]",
                      INTERVENTION_TYPE_STYLES[event.type]
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="grid min-w-0 flex-1 grid-cols-[auto_1fr] items-center gap-x-6 gap-y-0">
                    <span className="row-span-2 self-center text-[15px] leading-tight text-muted-foreground">
                      {formatDate(event.date)}
                    </span>
                    <p className="min-w-0 truncate text-[16px] leading-tight font-semibold">
                      {event.description || dict.components.detail.noDescription}
                    </p>
                    {stats && (
                      <p className="min-w-0 truncate text-[15px] leading-tight text-muted-foreground">{stats}</p>
                    )}
                  </div>
                </Link>
              </div>
            );
          } else if (event.kind === "warrantyExpired") {
            content = (
              <div className="flex flex-col items-center gap-3">
                <TimelineDot />
                <MilestonePill
                  icon={<WarrantyIcon className="size-3.5" />}
                  label={dict.bikes.detail.warrantyExpired}
                  date={formatDate(event.date)}
                />
              </div>
            );
          } else if (event.kind === "purchased") {
            content = (
              <div className="flex flex-col items-center gap-3">
                <TimelineDot />
                <MilestonePill
                  icon={<PurchasedIcon className="size-4" />}
                  label={dict.bikes.detail.purchased}
                  date={formatDate(event.date)}
                />
              </div>
            );
          } else if (event.kind === "added") {
            content = (
              <div className="flex flex-col items-center gap-3">
                <TimelineDot />
                <div className="flex flex-col items-center gap-2 rounded-[12px] bg-card px-8 py-6 text-center">
                  <BikeIcon type={bikeType} size="lg" plain className="size-16" />
                  <div className="flex flex-col items-center gap-0.5">
                    <p className="text-base leading-tight font-semibold">{dict.bikes.detail.addedToBikit}</p>
                    <p className="text-sm leading-tight text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                  <LogoIcon className="mt-1 size-6 text-foreground" />
                </div>
              </div>
            );
          } else {
            content = (
              <div className="flex flex-col items-center gap-3">
                <TimelineDot />
                <MilestoneCard
                  icon={<ManufacturedIcon className="size-6" />}
                  label={dict.bikes.detail.manufactured}
                  subtitle={event.brand ?? undefined}
                  date={event.year}
                />
              </div>
            );
          }

          const key = event.kind === "intervention" ? event.id : event.kind;
          return (
            <Fragment key={key}>
              {event.yearLabel && <YearLabel year={event.yearLabel} />}
              {content}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
