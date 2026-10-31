import Link from "next/link";
import { AppHeader } from "@/features/two-worlds/components/AppHeader";
import { ContinueNotice } from "@/features/two-worlds/components/ContinueNotice";
import { Icon } from "@/features/two-worlds/components/Icon";
import { CASES } from "@/features/two-worlds/content";
import { typography } from "@/features/two-worlds/utils/typography";

const STEPS = [
  {
    title: "Prozkoumej podklady",
    text: "Zpráva, příloha, kolega, telefony. Rozhoduješ, co otevřeš a komu zavoláš.",
  },
  {
    title: "Rozhodni se",
    text: "Odsouhlasit, odmítnout, nebo počkat. Nikdo tě nenutí nic ověřovat.",
  },
  {
    title: "Uvidíš obě reality",
    text: "Stejná zpráva ve dvou připravených realitách. Kde se tvoje kroky rozešly?",
  },
];

const CASES_PREVIEW = [
  {
    kicker: "případ 1",
    title: CASES.evening.title,
    text: "Dodavatelka chce zálohu na zítřejší dodání poslat na nový účet. Tady se hraje první pokus a uvidíš obě reality.",
  },
  {
    kicker: "případ 2 · po vlastním postupu",
    title: CASES.handover.title,
    text: "Dopravce má vyzvednout zapůjčené ozvučení jinde, než bylo domluveno. Vyzkoušíš si na něm svůj postup v nové situaci.",
  },
];

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <main id="main" tabIndex={-1} className="ds-container overflow-x-clip pb-20">
        <section aria-labelledby="hero-heading" className="relative">
          {/* The seam between the two realities runs through the whole opening, under the message. */}
          <div aria-hidden="true" className="ds-seam" />

          <div className="relative pt-16 text-center sm:pt-18">
            <p className="text-small font-bold">
              <span className="bg-paper px-2">Interaktivní detektivka o jednom požadavku</span>
            </p>
            <h1 id="hero-heading" className="ds-overprint ds-overprint--ink mt-5 sm:mt-8">
              <span className="ds-overprint__plate" aria-hidden="true">
                Dva světy
              </span>
              <span className="ds-overprint__text">Dva světy</span>
            </h1>
          </div>

          <div className="relative mt-8 grid gap-6 sm:mt-14 sm:grid-compare sm:gap-24">
            <p className="bg-paper font-display text-h3 leading-head font-bold tracking-display sm:bg-transparent sm:text-right sm:text-h2">
              {typography("Když všechno působí důvěryhodně, co si ověříš?")}
            </p>
            <div className="sm:max-w-lg">
              <p className="bg-paper text-body-lg leading-body text-ink-2 sm:max-w-120 sm:bg-transparent sm:text-body">
                {typography(
                  "Krátký příběh o jednom požadavku dodavatele. Prohlédneš podklady, rozhodneš se a pak uvidíš, co by stejné kroky ukázaly ve dvou různých realitách.",
                )}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/play" className="ds-btn">
                  Otevřít případ
                  <Icon name="arrow" />
                </Link>
                <Link href="/about" className="ds-btn ds-btn--secondary bg-paper">
                  Jak to funguje
                </Link>
              </div>
              <div className="mt-4 bg-paper text-small text-ink-3 sm:bg-transparent">
                <ContinueNotice />
              </div>
            </div>
          </div>

          <div className="relative mx-auto mt-18 max-w-xl sm:mt-24">
            <article
              aria-label="Ukázka zprávy z případu"
              className="ds-sheet px-5 pt-6 pb-7 sm:px-8"
            >
              <span className="ds-crop" aria-hidden="true" />
              <p className="ds-sheet__tab">list 01 · e-mail</p>
              <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3 text-small">
                <p>
                  <b>Klára</b> &lt;klara@javor.example&gt;
                </p>
                <p className="shrink-0 font-mono text-meta text-ink-3">dnes 16:42</p>
              </div>
              <p className="mt-4 font-display text-h3 leading-head font-bold tracking-display">
                {typography("Zítřejší dodání: změna platebních údajů")}
              </p>
              <p className="mt-4 leading-body">
                {typography(
                  "Ahoj, jen prosím o úhradu zálohy 8 400 Kč k objednávce JAVOR-014 ještě dnes. Změnili jsme účet, nové údaje posílám v příloze…",
                )}
              </p>
            </article>
            <div
              aria-hidden="true"
              className="grid grid-compare gap-10 pt-12 pb-8 font-mono text-meta"
            >
              <span className="text-right">první realita</span>
              <span>druhá realita</span>
            </div>
          </div>
        </section>

        <section aria-labelledby="how-heading" className="border-section">
          <h2 id="how-heading" className="sr-only">
            Jak hra probíhá
          </h2>
          <ol className="grid border-b border-ink md:grid-cols-3">
            {STEPS.map(({ title, text }, index) => (
              <li
                key={title}
                className="flex gap-6 border-ink py-6 not-first:border-t md:gap-4 md:px-7 md:py-7 md:not-first:border-t-0 md:not-first:border-l md:first:pl-0"
              >
                <span
                  aria-hidden="true"
                  className="w-14 shrink-0 font-display text-h1 leading-tight font-extrabold md:w-auto"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-display text-h4 leading-head font-bold tracking-display sm:text-h3">
                    <span className="sr-only">{index + 1}. </span>
                    {title}
                  </p>
                  <p className="mt-2 leading-body text-ink-2">{typography(text)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="grid gap-x-14 gap-y-6 border-b border-ink py-7 md:grid-label-pair">
            <p className="font-mono text-meta">dva případy</p>
            {CASES_PREVIEW.map(({ kicker, title, text }) => (
              <div key={title}>
                <p className="font-mono text-meta text-ink-3">{kicker}</p>
                <p className="mt-1 font-display text-h4 leading-head font-bold tracking-display">
                  {title}
                </p>
                <p className="mt-2 leading-body text-ink-2">{typography(text)}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 flex gap-3 text-small text-ink-2">
            <span className="font-mono text-meta text-ink">pozn.</span>
            {typography(
              "Simulace. Všechny osoby, firmy, účty a kontakty jsou smyšlené. Žádný úkon nic neodesílá, nevolá ani neplatí. Průběh zůstává jen v tomto prohlížeči.",
            )}
          </p>
        </section>
      </main>
    </>
  );
}
