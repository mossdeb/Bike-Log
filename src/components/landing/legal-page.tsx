import Link from "next/link";
import { landingHeadingFont, landingBodyFont } from "@/components/landing/fonts";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { getLandingDictionary, getLegalDictionary, type LandingLocale } from "@/components/landing/i18n";
import type { LegalBlock, LegalSection } from "@/components/landing/i18n/legal-en";
import { LEGAL_ENTITY } from "@/lib/legal";

/**
 * List items are written as `Term — explanation`; the term is bolded here so
 * the dictionaries stay free of markup. An item without the separator renders
 * whole, which is what the plain enumerations rely on.
 */
function Bullet({ text }: { text: string }) {
  const separator = " — ";
  const at = text.indexOf(separator);

  if (at === -1) return <li className="leading-relaxed">{text}</li>;

  return (
    <li className="leading-relaxed">
      <span className="font-bold text-[#101014]">{text.slice(0, at)}</span>
      {text.slice(at)}
    </li>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-3 pl-5 text-sm text-[#35363C] marker:text-[#B8B3AF]">
      {items.map((item) => (
        <Bullet key={item} text={item} />
      ))}
    </ul>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.kind === "p") return <p className="leading-relaxed">{block.text}</p>;

  if (block.kind === "ul") return <BulletList items={block.items} />;

  // A titled sub-section: its own heading, then its paragraphs, then an
  // optional list. Slightly more space above than a plain paragraph gets, so
  // the title reads as belonging to what follows it rather than to what
  // precedes it.
  return (
    <div className="mt-2 flex flex-col gap-2">
      <h3 className="font-[family-name:var(--font-landing-heading)] text-[16px] font-bold leading-[24px] text-[#101014]">
        {block.title}
      </h3>
      {block.paragraphs.map((paragraph) => (
        <p key={paragraph} className="leading-relaxed">
          {paragraph}
        </p>
      ))}
      {block.items ? <BulletList items={block.items} /> : null}
    </div>
  );
}

function Section({ section }: { section: LegalSection }) {
  return (
    <section className="mt-10">
      <h2 className="font-[family-name:var(--font-landing-heading)] text-[18px] font-bold leading-[26px] text-[#101014] sm:text-[22px] sm:leading-[30px]">
        {section.heading}
      </h2>
      <div className="mt-3 flex flex-col gap-4 text-sm text-[#35363C]">
        {section.blocks.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>
    </section>
  );
}

export function LegalPage({
  locale,
  document: documentKey,
}: {
  locale: LandingLocale;
  document: "privacy" | "terms";
}) {
  const nav = getLandingDictionary(locale).nav;
  const footer = getLandingDictionary(locale).footer;
  const legal = getLegalDictionary(locale);
  const doc = legal[documentKey];

  const controllerRows = [
    { label: doc.controller.nameLabel, value: LEGAL_ENTITY.name },
    { label: doc.controller.emailLabel, value: LEGAL_ENTITY.email },
    { label: doc.controller.countryLabel, value: LEGAL_ENTITY.country },
  ];

  return (
    <div
      id="top"
      className={`${landingHeadingFont.variable} ${landingBodyFont.variable} min-h-screen bg-white font-[family-name:var(--font-landing-body)]`}
    >
      <LandingHeader nav={nav} locale={locale} hrefBase="/" />

      {/* Masthead in the header's own colour, inset at xl exactly like the hero
          card — so the coloured band never reads as a stray stripe. */}
      <section className="bg-white xl:px-8 xl:pt-4">
        <div className="bg-[#B8B3AF] xl:rounded-[20px]">
          <div className="mx-auto max-w-[1160px] px-5 py-12 sm:px-8 xl:py-16">
            <h1 className="font-[family-name:var(--font-landing-heading)] text-[30px] font-bold leading-tight text-white sm:text-[42px]">
              {doc.title}
            </h1>
            <p className="mt-3 text-xs text-[#101014]/70">
              {legal.updatedLabel}: {legal.updated}
            </p>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-[760px] px-5 pb-16 pt-12 sm:px-8 md:pb-24">
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-[#35363C]">
          {doc.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <section className="mt-10 rounded-[20px] border border-[#101014]/[0.09] p-6">
          <h2 className="font-[family-name:var(--font-landing-heading)] text-[18px] font-bold leading-[26px] text-[#101014]">
            {doc.controller.heading}
          </h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            {controllerRows.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="text-[#8A8D93] sm:w-48 sm:shrink-0">{row.label}</dt>
                <dd className="text-[#101014]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {doc.sections.map((section) => (
          <Section key={section.heading} section={section} />
        ))}

        <Link
          href="/"
          className="mt-12 inline-flex text-xs font-bold text-[#101014] underline underline-offset-4 hover:text-[#35363C]"
        >
          {legal.backToHome}
        </Link>
      </article>

      <LandingFooter dict={footer} hrefBase="/" />
    </div>
  );
}
