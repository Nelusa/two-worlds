# Dva světy: pravidla pro práci v repozitáři

Co aplikace dělá, je v [README.md](README.md). Stav plnění zadání je v [docs/implementation-status.md](docs/implementation-status.md), při navazování pokračuj podle něj.

## Invarianty

- **Realita se určuje jen ze seedu** (`setupFromSeed`). Nesmí záviset na krocích hráče, znění zprávy, dostupnosti kontaktu ani předchozím výsledku.
- **Před rozhodnutím je DOM v obou realitách stejný**, dokud hráč nepoloží konkrétní otázku přes dřívější kontakt. E2E test `the workspace DOM is identical…` to hlídá. Žádné atributy, barvy ani ARIA texty odvozené od reality.
- **Totožnost a změna jsou různá tvrzení** (`identity_confirmed` vs `requested_change_confirmed/denied`). Nezavádět jeden příznak „ověřeno“.
- **Podloženost se počítá jen z pozorování**, nikdy z reality. Žádné skóre.
- **Přehrání v druhé realitě končí první rozdílnou odpovědí.** Rozhodnutí se za ni nepřenáší.
- **Záznamy se jen přidávají.** První pokus se nikdy nepřepisuje.
- **Změna faktů nebo odpovědí = nová `CONTENT_VERSION`**, změna tvaru uložených dat = nová `SCHEMA_VERSION`.
- Klíče v localStorage začínají `two-worlds.`; mazání odstraňuje jen je.

## Konvence

Komponenty PascalCase, žádné `React.Foo`, žádné `for` cykly, žádné arbitrary Tailwind hodnoty ani hex v komponentách (tokeny jsou v `src/app/globals.css`). Texty v UI česky, bez dlouhé pomlčky.

## Ověření

`npm run verify`, E2E `npm run test:e2e`. Jednotlivý test: `npx vitest run <soubor>`.
