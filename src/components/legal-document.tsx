import type { LegalBlock, LegalDocument, LegalSection } from "@/components/landing/i18n/legal-en";
import { LEGAL_ENTITY } from "@/lib/legal";

/**
 * The body of a legal document, rendered on either of the two surfaces that
 * show it: the public landing page and the signed-in app.
 *
 * The text lives in one place (`landing/i18n/legal-{en,pt}.ts`) and carries no
 * markup, so nothing here duplicates content — what differs between the two is
 * only styling, and the two design systems are deliberately unalike: Exo 2 and
 * fixed hex on the landing, Anek Latin and theme tokens in the app. Hence one
 * traversal and a style map, rather than two components that would drift the
 * first time someone adds a block type to just one of them.
 *
 * The masthead stays with each caller: the landing page has its coloured band,
 * the app page a plain heading.
 */
export type LegalVariant = "landing" | "app";

type LegalStyles = {
  sectionHeading: string;
  subHeading: string;
  body: string;
  term: string;
  marker: string;
  card: string;
  cardHeading: string;
  cardLabel: string;
  cardValue: string;
};

const STYLES: Record<LegalVariant, LegalStyles> = {
  landing: {
    sectionHeading:
      "font-[family-name:var(--font-landing-heading)] text-[18px] font-bold leading-[26px] text-[#101014] sm:text-[22px] sm:leading-[30px]",
    subHeading: "font-[family-name:var(--font-landing-heading)] text-[16px] font-bold leading-[24px] text-[#101014]",
    body: "text-sm text-[#35363C]",
    term: "font-bold text-[#101014]",
    marker: "marker:text-[#B8B3AF]",
    card: "rounded-[20px] border border-[#101014]/[0.09] p-6",
    cardHeading: "font-[family-name:var(--font-landing-heading)] text-[18px] font-bold leading-[26px] text-[#101014]",
    cardLabel: "text-[#8A8D93] sm:w-48 sm:shrink-0",
    cardValue: "text-[#101014]",
  },
  app: {
    sectionHeading: "font-display text-[18px] font-bold leading-[26px] text-foreground sm:text-[22px] sm:leading-[30px]",
    subHeading: "font-display text-[16px] font-bold leading-[24px] text-foreground",
    body: "text-sm text-muted-foreground",
    term: "font-bold text-foreground",
    marker: "marker:text-muted-foreground",
    // The app page is itself a card, so the controller block is set off with a
    // border rather than a second `bg-card` that would land on its own colour.
    card: "rounded-[20px] border border-border p-6",
    cardHeading: "font-display text-[18px] font-bold leading-[26px] text-foreground",
    cardLabel: "text-muted-foreground sm:w-48 sm:shrink-0",
    cardValue: "text-foreground",
  },
};

/**
 * List items are written as `Term — explanation`; the term is bolded here so
 * the dictionaries stay free of markup. An item without the separator renders
 * whole, which is what the plain enumerations rely on.
 */
function Bullet({ text, styles }: { text: string; styles: LegalStyles }) {
  const separator = " — ";
  const at = text.indexOf(separator);

  if (at === -1) return <li className="leading-relaxed">{text}</li>;

  return (
    <li className="leading-relaxed">
      <span className={styles.term}>{text.slice(0, at)}</span>
      {text.slice(at)}
    </li>
  );
}

function BulletList({ items, styles }: { items: string[]; styles: LegalStyles }) {
  return (
    <ul className={`flex list-disc flex-col gap-3 pl-5 ${styles.body} ${styles.marker}`}>
      {items.map((item) => (
        <Bullet key={item} text={item} styles={styles} />
      ))}
    </ul>
  );
}

function Block({ block, styles }: { block: LegalBlock; styles: LegalStyles }) {
  if (block.kind === "p") return <p className="leading-relaxed">{block.text}</p>;

  if (block.kind === "ul") return <BulletList items={block.items} styles={styles} />;

  // A titled sub-section: its own heading, then its paragraphs, then an
  // optional list. Slightly more space above than a plain paragraph gets, so
  // the title reads as belonging to what follows it rather than to what
  // precedes it.
  return (
    <div className="mt-2 flex flex-col gap-2">
      <h3 className={styles.subHeading}>{block.title}</h3>
      {block.paragraphs.map((paragraph) => (
        <p key={paragraph} className="leading-relaxed">
          {paragraph}
        </p>
      ))}
      {block.items ? <BulletList items={block.items} styles={styles} /> : null}
    </div>
  );
}

function Section({ section, styles }: { section: LegalSection; styles: LegalStyles }) {
  return (
    <section className="mt-10">
      <h2 className={styles.sectionHeading}>{section.heading}</h2>
      <div className={`mt-3 flex flex-col gap-4 ${styles.body}`}>
        {section.blocks.map((block, index) => (
          <Block key={index} block={block} styles={styles} />
        ))}
      </div>
    </section>
  );
}

export function LegalDocumentBody({ doc, variant }: { doc: LegalDocument; variant: LegalVariant }) {
  const styles = STYLES[variant];

  const controllerRows = [
    { label: doc.controller.nameLabel, value: LEGAL_ENTITY.name },
    { label: doc.controller.emailLabel, value: LEGAL_ENTITY.email },
    { label: doc.controller.countryLabel, value: LEGAL_ENTITY.country },
  ];

  return (
    <>
      <div className={`flex flex-col gap-4 leading-relaxed ${styles.body}`}>
        {doc.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className={`mt-10 ${styles.card}`}>
        <h2 className={styles.cardHeading}>{doc.controller.heading}</h2>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          {controllerRows.map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className={styles.cardLabel}>{row.label}</dt>
              <dd className={styles.cardValue}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {doc.sections.map((section) => (
        <Section key={section.heading} section={section} styles={styles} />
      ))}
    </>
  );
}
