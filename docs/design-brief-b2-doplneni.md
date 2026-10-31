# Doplnění směru B2: Dva světy

Směr B2 „Soutisk se spisem“ je převedený do aplikace. Při převodu se ukázalo, že aplikace má několik obrazovek a stavů, které v balíčku nakreslené nejsou. Zatím jsem je složila ze stávajících komponent B2 (tokeny, `.ds-*` třídy, ikony), ale potřebovala bych je dokreslit, aby k nim existoval vzor stejně jako k ostatním.

Prosím o stejný výstup jako u balíčku B2: PNG v 1440 a 390 px a u nových prvků CSS nebo popis, které stávající komponenty použít. Tokeny ani pevná pravidla neměň (žádné barvy desek před rozhodnutím, realita vždy slovy, bez hodnocení, bez zaoblení a stínů). Přikládám screenshoty současné podoby ze složky `docs/screenshots/`.

## Co chybí v návrhu

1. **Dialog rozhodnutí: otázka na podklady.** Pod třemi přepínači je ještě nepovinná otázka „O které podklady se opíráš?“ se zaškrtávacími políčky (seznam získaných podkladů, např. „Nová zpráva od klara@javor.example“, „Odpověď Adama“, „Hovor přes uložený kontakt“). Aplikace z ní počítá podloženost rozhodnutí. Teď je to `.ds-choice--plain` ve dvou sloupcích.

2. **Historie úkonů je delší.** Aplikace zapisuje i otevření uložené karty a ověření totožnosti, takže typický průchod má 6 úkonů a rozchod nastává na úkonu 6. Vzhled řádků zůstává, jen prosím ověřit, že tabulka i úzká varianta snesou 6 a více řádků.

3. **Postupné odkrývání odhalení.** Odhalení se v aplikaci odkrývá po oddílech: pod oddílem 1 jsou tlačítka „Pokračovat v odhalení“ a „Ukázat vše najednou“. Choreografie každého oddílu se spouští, až když se oddíl objeví. Pod oddílem 3 je navíc mapa původu ve dvou sloupcích s vysvětlením pod každou skupinou. Potřebovala bych stav po oddílu 1, po oddílu 2 a umístění mapy.

4. **Výsledek větve.** Po rozhodnutí v procvičovací větvi se ukáže „Výsledek větve“: realita, rozhodnutí, důsledek, karta podloženosti a tlačítka „Sestavit vlastní postup“ a „Zpět na dvě reality“.

5. **Vlastní postup: řazení a výsledek.** Aplikace drží pořadí úkonů podle přidání a v „Tvém postupu“ jde každý krok posunout výš, níž nebo odebrat. Když krok potřebuje jiný (např. ověření potřebuje otevřenou kartu), objeví se upozornění s tlačítkem „Vložit krok před“. Je tam i přepínač „Vyzkoušet s nedostupným původním kontaktem“ a „Vložit ukázkový postup“. Rozhodnutí se v aplikaci volí až po přehrání, zvlášť pro každou větev, pokud se odpovědi rozešly. Chybí tedy i obrazovka výsledku přehrání (srovnání úkonů a rozhodnutí ve větvích).

6. **Druhý případ „Poslední změna před předáním“** (PREDANI-026, Místo A a Místo B). Stejná plocha s jinými listy: Nová zpráva, Nový kontakt, Přeposlané potvrzení, Původní kontakt dispečinku, Původní potvrzení dopravy. Stačí ukázat, že ouška a listy sedí i na jiný obsah.

7. **Závěrečná karta „Můj ověřovací postup“.** Tři zásady, přehled rozhodnutí v simulaci a tlačítka „Zkopírovat text“, „Stáhnout jako text“ a „Nový pokus“.

8. **Ukázkový režim** (`/demo`). Nastavení pro prezentaci: realita, znění zprávy a dostupnost kontaktu pro oba případy. Teď jsou to segmentové přepínače s linkou 2 px. V běžné hře je nahoře pruh „Ukázkový režim s připravenými podmínkami…“.

9. **Uložený průběh: další stavy.** Mobilní podoba pod 600 px (teď řádky pod sebou a tlačítko na celou šířku), prázdný stav, část „Stáhnout průběh (JSON)“ a hláška, když uložená data nejdou přečíst. Tlačítko „Pokračovat“ má jen rozehraný průchod, starší záznamy jsou jen ke čtení.

10. **Drobné stavy:** stránka 404 „Tahle stopa nikam nevede“, načítání „Otevírám případ…“, chyba uložení („Průběh se nepodařilo uložit…“) a otevřené mobilní menu v hlavičce.

## Rozdíly, které stojí za rozhodnutí

- **Označení případu.** Návrh píše „spis č. 1“, aplikace „Případ 1“ (teď malými písmeny v mono písmu: „případ 1 · odhalení“). Mám přejít na „spis č. 1“?
- **Velikost titulku na mobilu.** PNG úvodu na 390 px má „Dva světy“ větší, než dovoluje token `--fs-hero` (min. 88 px). Aplikace drží token.
- **Ikony v ouškách.** Na 1024 a 390 px jsou v PNG ikony jinak než v `components.css` (ten je pod 900 px skrývá). Aplikace se drží CSS.
