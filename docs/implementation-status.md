# Stav implementace

Stav k 26. 10. 2026. Povinný rozsah zadání je implementovaný a ověřený níže popsanými kontrolami. Nic není commitnuté.

## Dokončeno

1. Úvod `/` s CTA „Otevřít případ“ a označením simulace.
2. Hlavní případ „Večer, který se má uskutečnit“: dvě reality, dvě jazykové varianty zprávy (`v1`, `v2`), varianta s nedostupným uloženým kontaktem.
3. Pracovní plocha: podklady a kontakty, dominantní panel, historie úkonů, rozhodovací dialog (volitelné označení podkladů).
4. Mapa původu jako vnořený seznam (vizuál i textový ekvivalent zároveň), společný původ přílohy, Adama a čísla z přílohy.
5. Odhalení ve třech krocích ovládaných tlačítkem: stejná zpráva, úkony v obou realitách, rozhodnutí a důsledky.
6. Přehrání do první rozdílné odpovědi, pokračování každé větve jako procvičování.
7. „Můj postup“: výběr, řazení tlačítky, kontrola návazností, nedostupný kontakt, ukázkový postup označený jako ukázka, oddělené rozhodnutí pro větve.
8. Přenosový případ „Poslední změna před předáním“ (PREDANI-026, Místo A/B), nedostupný původní kontakt losovaný nezávisle na realitě (1/3).
9. localStorage se `schemaVersion`, `contentVersion`, seedem, režimem a posloupností akcí; obnova, zotavení z poškozené či nepodporované verze, export JSON, mazání jen klíčů aplikace, limit 20 záznamů.
10. `/demo` (označený ukázkový režim, oddělené úložiště), `/about`, README, demo scénář, návrh pilotu, popis použití AI.

## Vizuální přestavba (26. 10.)

- Fonty Fraunces (příběh, nadpisy) a Inter (pracovní plocha) přibalené lokálně přes `@fontsource-variable`, build ani běh nic nestahují.
- Každá obrazovka začíná tmavou hlavičkou spisu (`StageHeader`), případ má hodiny příběhu.
- Pracovní plocha: očíslovaný seznam podkladů (na mobilu vodorovný pás), papírový list s e-mailem, dokumenty s tečkovanými řádky, kartotéka kontaktu, hovory jako přepis rozhovoru, vpravo mapa původu a časová osa, rozhodnutí v plovoucí liště.
- Žádné nativní prvky formulářů na očích: vlastní karty voleb, štítky, přepínač a segmenty (`Controls.tsx`), pod nimi skutečné inputy kvůli klávesnici a čtečkám.

## Revize kódu (26. 10.)

- Bez přetypování `as` mimo jednu nutnou CSS proměnnou; uložená data validuje typová stráž `isGameState` (režim, krok, rozhodnutí, odkazy na záznamy).
- Akce otevření přílohy je v obsahu případu (`attachmentAction`), komponenty neznají ID konkrétního případu.
- `RunStep` vylučuje krok `procedure`, který nikdy neběží na pracovní ploše.
- Čtení localStorage v demu a na úvodu přes `useStoredItem` (useSyncExternalStore), bez efektů a výjimek z lintu. Jediná zbývající výjimka je zápis výsledku ukládání do UI v `Game.tsx`, zdůvodněná komentářem.
- Načtení stavu je chráněné proti dvojímu spuštění efektu ve StrictMode.
- Hlavička případu má tlačítko „Jak na to“ s dialogem o třech bodech. Vysvětluje jen ovládání, ne to, kterému zdroji věřit, aby první pokus zůstal hráčův.
- Doplněno: ikona záložky, vlastní stránka 404, načítací stav ve vzhledu aplikace, posun vybraného podkladu do zorného pole na mobilu.

## Dotažení vzhledu (26. 10.)

- Typografie: Fraunces jen pro nadpisy a číslice, bez kurzívy (soubor kurzívy se už nenačítá); veškerý text včetně e-mailu a citací v Inter.
- Výběr podkladů v rozhodnutí jsou čtvercové checkboxy (`CheckOption`), jediná volba zůstává kulatá.
- Karty podkladů bez odstávajícího proužku a prázdného místa; výběr je rámeček a stín.
- Kurzor ruky na všech tlačítkách (preflight Tailwindu ho resetuje), odezva na stisk, hover s jemným zvednutím, plynulý vstup dialogu a lišty.
- Mapa původu ukazuje jen zdroje a vztahy, odpovědi jsou v historii (dřív se opakovaly na obou místech).
- Pracovní plocha mezi 1024 a 1279 px má dva sloupce, mapa a historie jsou pod listem; tři sloupce až od 1280 px.
- Dialog rozhodnutí má na mobilu tlačítka pod sebou.
- Odstraněná animace kreslení rozvětvení, která se kvůli neškálovanému tahu lámala na kousky.
- Zkontrolováno ve 390, 768, 1024, 1280 a 1440 px: bez horizontálního scrollu, bez chyb v konzoli.

## Zklidnění a vyzrání vzhledu (26. 10.)

- Fonty jsou v `public/fonts` (s licencemi OFL), přednačítají se v `layout.tsx` a mají záložní písmo se shodnými metrikami podle dat Next.js, takže text při načtení nepřeskakuje. Balíčky `@fontsource` odstraněny.
- Animace kratší (220 ms) a jemnější; bez vstupní animace celého listu při přepnutí podkladu a bez animace uzlů mapy, bez poskakování při hoveru.
- Menší písmo a řádkování (Inter 14 až 16 px, řádkování 1,5), menší nadpisy, menší vnitřní okraje.
- Zaoblení 6 až 14 px místo tabletek, kulatá zůstávají jen avatary, tečky a přepínače. Bez dekorativních kruhů v hlavičce, slabší stíny.
- Časová osa: čára a tečky na společném středu.
- Přístupnost: odkaz „Přeskočit na obsah“, `main#main` na všech stránkách, zvýrazněná aktuální stránka v navigaci, hover u přepínače a loga.

## Redakční přestavba (28. 10.)

- Nové pojetí „redakční spis“ místo dashboardu: hierarchii nesou typografie a tenké linky, jediný předmět se stínem je list papíru (`shadow-sheet`). Pryč tmavé pruhy, tečkované pozadí, kapitálkové štítky, tabletky, karty v kartách a plovoucí lišta.
- Pracovní plocha: rejstřík podkladů jako obsah knihy (na mobilu záložky), list papíru, vpravo marginálie s rozhodnutím, mapou původu jako stromem z linek a časovou osou. Pod 1280 px je rozhodnutí v liště ukotvené dole.
- Hovory jako přepis (Otázka / Odpověď), e-mail s hlavičkou Od / Přijato.
- Podpisový prvek: šev mezi dvěma světy (`SplitBand`). Úvod je rozdělený na dvě barevné plochy, odhalení a postup ukazují stejné odpovědi jako kartu přes šev a v místě rozdílu se řádek rozevře.
- Zkontrolováno v 390, 768, 1024, 1280 a 1440 px bez vodorovného scrollu a chyb v konzoli.

## Směr B2 „Soutisk se spisem“ (29. 10.)

Vizuál převzatý z balíčku Claude Design v `design/b2/` (zadání `CLAUDE-CODE.md`, vzory v `screens/`). Logika hry, obsah případů a datový model se neměnily.

- **Základ:** `src/styles/` obsahuje `tokens.css`, `components.css` a `reveal.css` beze změny z balíčku (jen font stacky mají navíc náhradní písma s naměřenými metrikami proti poskakování). Tailwind je jen zpřístupňuje pod stejnými názvy (`@theme inline`), staré tokeny, Fraunces a Inter jsou pryč. Písma Bricolage Grotesque a Atkinson Hyperlegible Next/Mono jsou přibalená v `public/fonts` a přednačtená.
- **Barvy desek až po rozhodnutí:** logo, plochy realit, linky a štítky používají `--plate-*` jen v odhalení, ve větvi, ve výsledcích a v uloženém průběhu u rozhodnutých záznamů. E2E to kontroluje výpočtem barev všech prvků před rozhodnutím.
- **Plocha:** ouška `.ds-tabs` napojená na list, okraj spisu (rozhodnutí a mapa původu), historie přes celou šířku. Rozvržení 1440 / 1024 / 768 / 390 podle PNG, na mobilu lišta s rozhodnutím ke spodní hraně. Po otevření ouška fokus na nadpis listu, po odpovědi na další otázku. Přepis hovoru má `aria-live="polite"`.
- **Odhalení:** choreografie z `reveal.js` převedená do hooku `useRevealChoreography` (oddíly se přehrají při dorolování, při omezení pohybu hned koncový stav, tlačítko „Přehrát odhalení znovu“). Obě reality i obě buňky rozchodu startují současně.
- **Uložený průběh** je samostatná stránka `/saved` místo dialogu: záznamy podle případů, rozehraný průchod s tlačítkem „Pokračovat“, export JSON a smazání s potvrzením.
- **Česká typografie:** `utils/typography.ts` (převod `typografie.js`) se používá při vykreslení textů z obsahu.

Co zůstalo podle aplikace místo podle návrhu:

- Dialog rozhodnutí má navíc nepovinnou otázku „O které podklady se opíráš?“ (počítá se z ní podloženost). Nadpis zůstal „Tvoje rozhodnutí“, odkaz „Zobrazit mapu původu“ není.
- Historie zapisuje i otevření uložené karty a ověření totožnosti, rozchod je proto na úkonu 6.
- Odhalení se dál odkrývá po oddílech tlačítky; choreografie se spouští u každého oddílu, když se objeví. Pod odhalením zůstává mapa původu.
- Vlastní postup drží pořadí a rozhodnutí až po přehrání (zvlášť pro každou větev). Úkony se vybírají zaškrtávacími políčky, pořadí se mění tlačítky výš, níž, odebrat.
- Texty „Jak na to“ a „Princip a omezení“ jsou z aplikace. Ve „Jak na to“ je upravená věta o „liště dole“ (tlačítko už není jen v liště). Na stránku Princip a omezení přibylo upozornění, že prozrazuje pointu.
- Označení případu zůstává „Případ 1“ (v návrhu „spis č. 1“), velikosti písma podle tokenů, i kde se PNG mírně liší.
- Obrazovky, které v balíčku nejsou (výsledek větve, výsledek postupu, druhý případ, závěrečná karta, ukázkový režim, 404), jsou složené ze stejných komponent. Doplňující zadání pro Claude Design je v `docs/design-brief-b2-doplneni.md`.

## Důležitá rozhodnutí

- Samostatný projekt `two-worlds/` vedle ostatních osobních projektů, port 3021, stejný stack jako sousední projekty + Playwright.
- Předmět e-mailu bez dlouhé pomlčky: „Zítřejší dodání: změna platebních údajů“.
- V hlavním případu je uložený kontakt v běžném režimu vždy dostupný; nedostupnost je v `/demo` a v „Můj postup“. V přenosovém případu se losuje.
- Podloženost má sedm slovních stavů (`assessGrounding`), žádné body. Odklad se nikdy netrestá.
- Systémové fonty, žádné stahování při buildu.

## Skutečně provedené kontroly

| Kontrola | Výsledek |
| --- | --- |
| `npm run typecheck` | bez chyb |
| `npm run lint` (ESLint + jsx-a11y) | bez chyb |
| `npm test` (Vitest) | 43/43 (nově i česká typografie), pokrývá všech 12 povinných pravidel, obě varianty zprávy, oba světy, dostupnost kontaktu zvlášť |
| `npm run build` | úspěšný produkční build |
| Playwright nad produkčním buildem, Chromium | 17/17 po převodu na B2 (29. 10.) |
| Celý průchod úvod → podklady → rozhodnutí → dvě reality → větev → Můj postup → přenosový případ → závěrečná karta | E2E `journey.spec.ts` (podvodný svět), legitimní svět, nedostupný kontakt |
| Neprozrazení světa | E2E: HTML `main` je v obou realitách totožné až do konkrétního dotazu; běžný režim neobsahuje demo ovladače ani výrazy jako „útočník“ |
| Refresh uprostřed a po dokončení, nový pokus, export, smazání, poškozená a cizí verze dat | E2E `normal-mode.spec.ts` |
| Klávesnice | E2E: případ až po „Můj postup“ jen klávesnicí, Escape zavře dialog a vrátí focus, focus po změně fáze na nadpis |
| Reduced motion | E2E: odhalení je hned v koncovém stavu, nic není skryté ani armované |
| Směr B2: „Hotovo, když“ | E2E: žádná barva desek před rozhodnutím (výpočet barev všech prvků), nedostupné ouško má `aria-disabled` a popis slovy, fokus na nadpis listu i dialogu, `aria-live` přepisu, focus 3 px s odsazením 3 px, obě reality startují současně, žádný požadavek na fonts.googleapis.com, 390 px bez posunu i na stránkách Princip a Uložený průběh |
| Vzhled proti PNG z `design/b2/screens/` | snímky úvodu, plochy (1440, 1024, 768, 390), dialogů, odhalení, větve, postupu, Principu a Uloženého průběhu prohlédnuté proti vzorům |
| 1440 × 900 a 390 × 844 | E2E bez horizontálního scrollu; screenshoty v `docs/screenshots/` prohlédnuté |
| Konzole a hydratace | E2E sbírá chyby konzole a výjimky, ve všech průchodech žádné |

Opravené nálezy z kontrol: přetečení úvodu na mobilu o 6 px; souběh, kdy se dialog po Escape a rychlém Enter znovu neotevřel; dlouhé dokumenty v historii; na mobilu se otevřený panel posune do zorného pole.

## Zbývající omezení

- E2E jen v Chromiu, Safari ani Firefox ověřené nejsou. Na skutečném telefonu netestováno.
- Zvětšení textu jen nepřímo (velikosti v rem, bez pevných výšek); samostatný test 200 % neproběhl. Kontrast barev počítaný ručně z tokenů, ne nástrojem. Nejde o prohlášení o splnění WCAG.
- Se čtečkou obrazovky ručně netestováno, jen struktura (nadpisy, landmarky, popisky, live region).
- Jazykovou kontrolu českých textů by měl udělat člověk.
- Živé AI a hlasová ukázka nejsou implementované (volitelné).
- Pilot neproběhl.

## Další krok

Projít aplikaci osobně (texty, tón, srozumitelnost odhalení bez vysvětlení autora), pak commit a případně krátký test s 1 až 2 lidmi z cílové skupiny.
