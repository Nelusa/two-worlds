import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppHeader } from "@/features/two-worlds/components/AppHeader";
import { Icon } from "@/features/two-worlds/components/Icon";
import { CASES } from "@/features/two-worlds/content";

export const metadata: Metadata = { title: "Princip a omezení" };

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="sm:grid sm:grid-step sm:gap-x-2">
      <p
        aria-hidden="true"
        className="font-display text-h3 leading-head font-extrabold tracking-display text-ink-3 tabular-nums"
      >
        {String(number).padStart(2, "0")}
      </p>
      <div>
        <h2 className="font-display text-h3 leading-head font-extrabold tracking-display">
          {title}
        </h2>
        <div className="mt-3 space-y-3 leading-body text-ink-2">{children}</div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <AppHeader />
      <main id="main" tabIndex={-1} className="ds-container pt-12 pb-24 sm:pt-16">
        <h1 className="font-display text-h1 leading-tight font-extrabold tracking-display">
          Princip a omezení
        </h1>
        <p className="mt-4 flex gap-3 text-small">
          <span className="font-mono text-meta">pozn.</span>
          Stránka prozrazuje pointu případu. Pokud jsi ho ještě nehrál/a, vrať se sem až po
          odhalení.
        </p>

        <div className="mt-12 border-y-4 border-ink py-8">
          <p className="ds-overprint ds-overprint--ink text-h1 whitespace-normal">
            <span className="ds-overprint__plate" aria-hidden="true">
              Stejná zpráva. Dvě reality. Rozhoduje, jak ji ověříš.
            </span>
            <span className="ds-overprint__text">
              Stejná zpráva. Dvě reality. Rozhoduje, jak ji ověříš.
            </span>
          </p>
          <p className="mt-6 max-w-160 leading-body text-ink-2">
            Dva světy je krátké cvičení pro lidi, kteří v malých firmách a spolcích vyřizují
            požadavky dodavatelů. Nejde o poznávání podvodných e-mailů podle vzhledu. Jde o to,
            odkud si vzít kontakt a co se přes něj zeptat.
          </p>
        </div>

        <section aria-labelledby="ai-heading" className="mt-14 max-w-200">
          <h2
            id="ai-heading"
            className="font-display text-h2 leading-head font-extrabold tracking-display"
          >
            Proč na tom s AI záleží
          </h2>
          <div className="mt-4 space-y-3 leading-body text-ink-2 sm:text-body-lg">
            <p>
              Hra vychází z obavy, že AI usnadní podvody. Jazykový model napíše zprávu bez chyb, ve
              stylu konkrétního člověka a v jakémkoli množství. Napodobený hlas zvládne i telefonát.
              Rada „podvodný e-mail poznáš podle chyb“ proto přestává platit.
            </p>
            <p>
              Dva světy proto neučí rozpoznat podvodnou zprávu. Učí ověřit konkrétní požadavek
              cestou, kterou zpráva nemohla podstrčit: kontaktem uloženým dřív a otázkou na přesnou
              změnu. Takový postup funguje bez ohledu na to, jak přesvědčivě zpráva vypadá.
            </p>
          </div>
        </section>

        <div className="mt-14 grid gap-x-14 gap-y-14 md:grid-cols-2">
          <Section number={1} title="Připravené reality">
            <p>
              Každý případ má dvě předem připravené reality: v jedné je změna skutečná, ve druhé
              schránku odesílatele zneužil někdo cizí. Zpráva, příloha, adresa i čas jsou v obou
              stejné. Která realita platí, se losuje při otevření případu a už se nemění. Nezávisí
              na tvých krocích, na znění zprávy ani na předchozím výsledku.
            </p>
            <p>
              Po rozhodnutí se tvé skutečné úkony přehrají i v druhé realitě, ale jen do první
              odpovědi, která by se lišila. Rozhodnutí, které jsi udělal/a po jiné informaci, se do
              druhé reality nepřenáší.
            </p>
          </Section>

          <Section number={2} title="Předpoklad modelu">
            <p>{CASES.evening.modelAssumption}</p>
            <p>
              Proto v simulaci rozhoduje odpověď na konkrétní otázku přes dřívější kontakt. Zpráva,
              její příloha, kolega, který četl tutéž zprávu, a číslo ze zprávy mají jeden společný
              původ, i když působí jako několik potvrzení. Potvrzení totožnosti neznamená potvrzení
              částky, účtu ani místa.
            </p>
          </Section>

          <Section number={3} title="Co se vyhodnocuje">
            <p>
              Odděleně dvě věci: co se v dané realitě stalo, a jak dobře rozhodnutí vychází ze
              získaných podkladů. Podloženost se počítá jen z toho, co jsi viděl/a, takže stejné
              podklady dostanou v obou realitách stejné hodnocení. Odklad bez odpovědi není chyba,
              jen úkol zůstává nevyřízený. Aplikace nemá body, skóre ani žebříček.
            </p>
          </Section>

          <Section number={4} title="Použití AI">
            <p>
              AI pomáhala s návrhem textů, jazykové varianty úvodní zprávy, vizuálu, kódu a testů.
              Všechny texty jsou pevně uložené a zkontrolované člověkem. Pravdu o realitách,
              odpovědi a vyhodnocení drží typovaný model, ne generovaný text. Při spuštění aplikace
              se žádné AI nevolá a nic se neodesílá.
            </p>
          </Section>

          <Section number={5} title="Ukládání dat">
            <p>
              Průběh se ukládá jen v tomto prohlížeči (localStorage), nejvýš posledních 20 záznamů.
              Neobsahuje jméno ani e-mail. Export do JSON stáhneš na žádost a smazání odstraní jen
              data této aplikace. Obojí najdeš na stránce „Uložený průběh“.
            </p>
            <p>
              Uložený čas je rozdíl mezi otevřením případu a rozhodnutím. Zahrnuje pauzy i dobu, kdy
              byla stránka zavřená, takže neměří aktivní čas.
            </p>
          </Section>

          <Section number={6} title="Stav ověření">
            <p>
              Pravidla scénáře a hlavní průchody jsou pokryté automatickými testy. Ty ověřují, že
              aplikace funguje podle návrhu, ne že lidem pomáhá. S uživateli z cílové skupiny se
              zatím netestovalo, návrh pilotu je v dokumentaci projektu.
            </p>
            <p>
              Pro prezentaci existuje{" "}
              <Link href="/demo" className="font-bold">
                ukázkový režim
              </Link>
              , ve kterém se realita volí předem. Jeho výsledky se ukládají odděleně a nejsou
              samostatný výkon.
            </p>
          </Section>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-ink pt-6 sm:flex-row">
          <Link href="/play" className="ds-btn">
            Otevřít případ
            <Icon name="arrow" />
          </Link>
          <Link href="/saved" className="ds-btn ds-btn--secondary">
            Uložený průběh
          </Link>
        </div>
      </main>
    </>
  );
}
