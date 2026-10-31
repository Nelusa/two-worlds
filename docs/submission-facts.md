# Fakta pro přihlášku

Stav k 31. 10. 2026. Jen to, co je v repozitáři doložitelné. Nic z toho není výsledek testování s lidmi.

## Co funguje

- Dva hratelné případy: „Večer, který se má uskutečnit“ (změna účtu pro zálohu) a „Poslední změna před předáním“ (změna místa vyzvednutí).
- Každý případ má dvě předem připravené reality se stejnou zprávou, přílohou, adresou i časem. Která platí, určuje jen seed při otevření případu.
- Pracovní plocha s podklady, otázkami, mapou původu a historií úkonů; rozhodnutí kdykoli (odsouhlasit, odmítnout, počkat).
- Odhalení: výsledek a podloženost rozhodnutí, obě reality, přehrání úkonů ve druhé realitě až do první rozdílné odpovědi, důsledky v obou realitách.
- Pokračování ve větvi od místa rozchodu, sestavení vlastního postupu s kontrolou předpokladů úkonů, samostatná rozhodnutí v rozdílných větvích, druhý případ, závěrečná karta.
- Ukládání průběhu v prohlížeči, stránka Uložený průběh s exportem do JSON a smazáním, označený ukázkový režim.
- Nasazení: https://dva-svety.vercel.app (statický Next.js na Vercelu), kód: https://github.com/Nelusa/two-worlds.

## Skutečně použité AI nástroje

- **Claude Code** (Anthropic): kód, testy, dokumentace, návrhy textů obou případů včetně druhé jazykové varianty úvodní zprávy, převod vizuálního směru do aplikace, skript pro natočení videa. V této pracovní relaci běžel model Claude Opus 5.5 (`claude-opus-5-5`); model dřívějších relací tady neověřuji.
- **Claude Design** (Anthropic): vizuální směr B2 „Soutisk se spisem“ podle zadání v `docs/design-brief.md`, balíček v `design/b2/`. Konkrétní model neuvádím, nemám ho ověřený.
- Zadání, fakta případů, pravidla vyhodnocení a kontrolu výsledků dělala autorka.

## Co běží za spuštění

- Jen statické stránky a JavaScript v prohlížeči. Žádné volání AI, žádné API, žádný vlastní server ani databáze, žádné API klíče.
- Pravdu o realitách, odpovědi a vyhodnocení drží typovaný deterministický model (`src/features/two-worlds/engine/`), ne generovaný text.
- Písma jsou přibalená v aplikaci, nic se nenačítá z cizích serverů (hlídá E2E test).

## Data, analytika a logování

- Průběh se ukládá jen do `localStorage` v prohlížeči hráče (klíče `two-worlds.*`). Neobsahuje jméno ani e-mail. Export a smazání jsou na stránce Uložený průběh.
- Aplikace nemá analytiku, měřicí skripty ani vlastní logování. V závislostech jsou jen `next`, `react` a `react-dom`.
- Hosting Vercel může vést běžné provozní záznamy o požadavcích na server (mimo kontrolu aplikace); aplikace do nich nic neposílá.
- Všechny osoby, firmy, účty a kontakty jsou smyšlené (doména `.example`).

## Provedené kontroly

- `npm run typecheck`, `npm run lint` (ESLint s jsx-a11y): bez chyb.
- Vitest: 43 testů pravidel scénáře, reduceru, ukládání a české typografie.
- Playwright nad produkčním buildem v Chromiu: 18 scénářů (celé průchody oběma světy, nedostupný kontakt, větev, vlastní postup, druhý případ, obnovení stránky, poškozená a cizí data, export a smazání, shodné DOM obou realit před rozhodnutím, žádná barva realit před rozhodnutím, klávesnice, omezení pohybu, mobil 390 px bez vodorovného posunu, ukotvená rozhodovací lišta na mobilu).
- Ruční prohlídka vykreslených obrazovek při 390 × 844, 768 × 1024, 1440 × 900 a 1512 × 827 px.

## Co ověřené není

- Testování s lidmi z cílové skupiny ani vzdělávací účinnost. Návrh pilotu je v `docs/pilot-guide.md`.
- Safari, Firefox a skutečný telefon (E2E běží jen v Chromiu).
- Ruční průchod se čtečkou obrazovky, jazyková korektura člověkem.
