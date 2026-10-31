# Dva světy

Krátký interaktivní detektivní příběh o ověřování požadavku dodavatele. Hráč dostane zprávu o změně platebních údajů, prohlíží podklady, volá kontakty a rozhodne se. Potom uvidí dvě připravené reality se stejným vstupem (skutečná změna a zneužitá schránka) a své úkony přehrané v obou až do místa, kde se získané informace rozcházejí. Následuje úprava vlastního ověřovacího postupu, kratší přenosový případ a závěrečná karta.

Stejná zpráva. Dvě reality. Rozhoduje, jak ji ověříš.

**Vyzkoušet:** https://dva-svety.vercel.app

## Proč

AI dnes napíše bezchybnou zprávu ve stylu konkrétního člověka a napodobí i hlas. Rada „podvodný e-mail poznáš podle chyb“ proto přestává platit. Dva světy neučí rozpoznat podvodnou zprávu, ale ověřit konkrétní požadavek cestou, kterou zpráva nemohla podstrčit: kontaktem uloženým dřív a otázkou na přesnou změnu. Hra je pro lidi v malých firmách a spolcích, kteří vyřizují platby a požadavky dodavatelů.

Všechny osoby, firmy, účty a kontakty jsou smyšlené (doména `.example`). Nic se neodesílá, nevolá ani neplatí. Aplikace běží bez serveru, bez účtu a bez API klíčů.

## Spuštění

```bash
npm install
npm run dev
```

Aplikace běží na http://localhost:3021. Produkční verze se nasazuje na Vercel z větve `main`.

| Stránka | Obsah |
| --- | --- |
| `/` | úvod a vstup do případu |
| `/play` | běžná hra, realita se losuje; v hlavičce případu je krátký návod „Jak na to“ |
| `/demo` | označený ukázkový režim s volbou reality, znění zprávy a dostupnosti kontaktu |
| `/about` | proč na tom s AI záleží, princip, předpoklad modelu, ukládání, stav ověření |
| `/saved` | uložený průběh v tomto prohlížeči, export do JSON a smazání |
| `/video` | video průchodu hrou (bez zvuku, skriptované klikání) |

## Kontroly

```bash
npm run typecheck   # tsc --noEmit
npm test            # Vitest: pravidla scénáře, reducer, ukládání
npm run lint        # ESLint včetně jsx-a11y
npm run build       # produkční build
npm run test:e2e    # produkční build + Playwright (Chromium)
npm run verify      # typy, testy, lint, build
```

Playwright potřebuje jednorázově `npx playwright install chromium`. E2E testy ukládají screenshoty do `docs/screenshots/`.

## Režimy záznamů

- `first_attempt`: první pokus hlavního případu, po rozhodnutí se nemění.
- `practice`: pokračování větve po odhalení a průchody vlastním postupem.
- `transfer`: přenosový případ „Poslední změna před předáním“.
- `demo`: vše z `/demo`, ukládá se pod samostatným klíčem.

Samostatný výkon popisují jen `first_attempt` a `transfer`.

## Struktura

- `src/features/two-worlds/engine/` čistý deterministický model: typy, výběr reality ze seedu, pozorování, tvrzení, podloženost, přehrávání, reducer.
- `src/features/two-worlds/content/` dva pevné obsahové balíčky (`evening.ts`, `handover.ts`).
- `src/features/two-worlds/storage/` localStorage se `schemaVersion` a `contentVersion`, validace, export, mazání.
- `src/features/two-worlds/components/` React komponenty. Stránky v `src/app/` jsou tenké.
- `src/styles/` tokeny, komponenty a choreografie odhalení z vizuálního směru B2, `design/b2/` celý balíček od Claude Design včetně vzorů obrazovek.

## Technologie

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Vitest, Playwright. Písma Bricolage Grotesque a Atkinson Hyperlegible (SIL OFL) jsou přibalená v `public/fonts`.

## Známé limity

- Výukový model předpokládá, že kontakt uložený dříve útočník neovládá. Jiné způsoby kompromitace nepokrývá.
- Obsah klienta (včetně obou realit) je čitelný ve vývojářských nástrojích. Je to záměr, nejde o ochranu tajemství.
- Uložený čas je rozdíl mezi otevřením a rozhodnutím, včetně pauz a zavřené stránky.
- Hra při spuštění žádnou AI nevolá a nemá audio. Jak AI pomohla při vývoji, popisuje `docs/ai-use.md`.
- S uživateli z cílové skupiny se zatím netestovalo, návrh pilotu je v `docs/pilot-guide.md`.
- E2E testy běží jen v Chromiu. Safari a Firefox nejsou ověřené.
