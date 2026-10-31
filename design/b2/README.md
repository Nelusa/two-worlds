# Dva světy · směr B2 „Soutisk se spisem“ · podklady pro vývoj

Balíček k návrhu na plátně „Dva světy – vizuální směry“ (řady B2). Obsahuje vše, co se dá
převzít do kódu bez dalšího překreslování: tokeny, písma, ikony, základní CSS komponent,
choreografii odhalení jako hotový kód a dvě funkční ukázky.

> Logiku hry a obsah případu přebírá aplikace. Tady jde jen o vizuální vrstvu a chování
> ovladačů. Ukázky v `demo/` mají zjednodušenou logiku (počítání podkladů, zápis do historie).

## Obsah

```
CLAUDE-CODE.md  zadání pro Claude Code: postup, pravidla, kritéria hotovo
screens/     PNG všech obrazovek B2 (1440, 1024, 768, 390 px) – vzor pro implementaci
tokens/      tokens.css (zdroj pravdy), tokens.json (stejné hodnoty pro nástroje)
fonts/       woff2 + fonts.css + licence OFL
icons/       11 ikon 24 px (tah 1,6 px, currentColor), značka soutisku, logo před/po rozhodnutí
components/  components.css – tlačítka, ouška, list, ořezové značky, volby, mapa původu,
             historie, dialog, reality, soutisk titulku a otisky desek, šev
reveal/      reveal.css + reveal.js – choreografie odhalení (bez závislostí)
utils/       typografie.js – nezlomitelné mezery a spojovníky pro češtinu
demo/        plocha.html (ouška, přepis, dialog rozhodnutí), odhaleni.html (animace)
```

Ukázky otevřeš přímo z disku (`demo/plocha.html`, `demo/odhaleni.html`), nic se nenačítá z internetu.

## Rychlý start

```html
<link rel="stylesheet" href="fonts/fonts.css">
<link rel="stylesheet" href="tokens/tokens.css">
<link rel="stylesheet" href="components/components.css">
<link rel="stylesheet" href="reveal/reveal.css">   <!-- jen na stránce odhalení -->
<script src="reveal/reveal.js" defer></script>    <!-- jen na stránce odhalení -->
<script src="utils/typografie.js"></script>
```

## Pevná pravidla (nepřekračovat)

1. **Do rozhodnutí žádné barvy desek.** `--plate-1`, `--plate-2` a jejich plochy se objeví až
   v odhalení, v pokračování ve větvi a v uloženém průběhu u záznamů *po* odhalení. Rozpracovaný
   záznam před rozhodnutím realitu neukazuje. Logo před rozhodnutím: `logo-pred-rozhodnutim.svg`.
2. **Realita se vždy pojmenuje slovy** („Realita 1 · Skutečná změna“, „Realita 2 · Zneužitá
   schránka“, „Stejně v obou realitách“). Barva je jen doplněk.
3. **Bez hodnocení**: žádné skóre, body, procenta, odpočet ani hodnotící věty o hráči.
4. **Rozhodnutí netlačí k odsouhlasení**: tři rovnocenné přepínače, nic předvybraného, pevné
   pořadí Odsouhlasit · Odmítnout · Počkat. Tlačítko „Rozhodnout o požadavku“ je dostupné vždy.
5. **Bez zaoblení, stínů, gradientů a kapitálek.** Hierarchii nesou linky 1 / 2 / 4 px a typografie.
6. **Soutisk jen u velkých titulků (nad 72 px) a za listem.** Běžný text se nikdy netiskne posunutě.

## Tokeny

Hodnoty jsou v `tokens/tokens.css`. Kontrast textu (WCAG 2.1, ověřeno výpočtem):

| text | podklad | poměr |
|---|---|---|
| `--ink` | `--paper` | 15,2 : 1 |
| `--ink-2` | `--paper` | 10,0 : 1 |
| `--ink-3` | `--paper` / `--sheet` / `--tab` | 6,7 / 7,6 / 6,0 : 1 |
| `--ink-on-tab` | `--tab` / `--tab-hover` | 7,2 / 6,3 : 1 |
| bílá | `--ink` / `--ink-hover` | 17,3 / 11,1 : 1 |
| `--plate-1` | `--paper` / `--plate-1-wash` | 7,6 / 7,0 : 1 |
| `--plate-2` | `--paper` / `--plate-2-wash` / `--sheet` | 4,9 / 4,6 / 5,6 : 1 |
| `--ink-2` | `--plate-1-wash` / `--plate-2-wash` | 9,3 / 9,4 : 1 |

Deska 1 je záměrně tmavší než deska 2 (relativní jas 0,07 proti 0,14), takže se obě reality
liší i světlostí, nejen odstínem. Na `--plate-2-wash` je deska 2 těsně nad hranicí (4,56 : 1):
nezesvětlovat a nepoužívat pod 14 px.

## Písma

| rodina | použití | řezy |
|---|---|---|
| Bricolage Grotesque (variabilní) | titulky, výpovědi, čísla úkonů, hodiny | wght 200–800, opsz 12–96 |
| Atkinson Hyperlegible Next | text a ovladače | 400, 700 |
| Atkinson Hyperlegible Mono | čísla listů, časy, telefony, spisové údaje | 400, 500 |

Všechna písma mají licenci SIL OFL 1.1 (soubory `fonts/OFL-*.txt`) a dají se přibalit. Každá
rodina má soubor `latin` a `latin-ext`. Pokrytí češtiny jsem ověřila nad soubory
(ě š č ř ž ý á í é ů ú ť ď ň, velká písmena, „ “ – …). **Šipka → v žádném z písem není**, proto
se všude používá `icons/sipka.svg`. Mono písmo má přeškrtnutou nulu (0), to je záměr.

## Komponenty → artboardy na plátně

| třída | kde je na plátně |
|---|---|
| `.ds-btn`, `.ds-btn--secondary`, `.ds-btn--question` | B2 · Stavy komponent |
| `.ds-tabs`, `.ds-tab` (`aria-current`, `aria-disabled`, `data-done`) | B2 · Plocha (desktop, tablet, mobil) |
| `.ds-sheet`, `.ds-sheet__tab`, `.ds-crop`, `.ds-fields`, `.ds-transcript` | B2 · Plocha, B2 · Ostatní listy |
| `.ds-choice` | B2 · Dialog rozhodnutí, B2 · Sestavit vlastní postup |
| `.ds-origin` | Mapa původu na ploše |
| `.ds-log`, `.ds-log--narrow` | Historie úkonů |
| `.ds-dialog` (nativní `<dialog>`) | Dialog rozhodnutí, Jak na to |
| `.ds-overprint`, `.ds-press`, `.ds-seam`, `.ds-reality`, `.ds-same` | B2 · Odhalení |

Stavy: najetí, stisk, focus a nedostupné jsou v CSS. Nedostupné ovladače mají `aria-disabled="true"`
(ne `disabled`) a vedle sebe důvod slovy. Klikání na ně musí ošetřit aplikace.

## Odhalení: choreografie

HTML značky: `data-reveal-section` na oddílu, `data-reveal="slide|fade|print|grow"` na prvku
a `data-reveal-delay="ms"`. Koncový stav je v normálním CSS, animace popisuje jen začátek.

| čas od spuštění oddílu | co se děje | typ |
|---|---|---|
| 0–600 ms | soutisková linka (šev) se protáhne | grow |
| 400–1300 ms | titulek „Dvě reality“ se rozjede na dvě desky (±5 px, mobil ±3 px) | slide |
| 700–1600 ms | otisky desek vyjedou zpod zprávy (±40 px, mobil ±12 px) | slide |
| 1500–2000 ms | obě reality se rozsvítí **současně** | fade |
| 1900–2400 ms | štítek „Tady proběhl tvůj pokus“ | fade |
| oddíl 2: 0 / 200 / 400 ms | úkony 1–3 se „tisknou“ přes celou šíři | print |
| oddíl 2: 700 ms | štítek „Tady se získané informace rozcházejí“ | fade |
| oddíl 2: 1000 ms | obě buňky úkonu 4 **současně** | print |
| oddíl 3: 0 ms | důsledky v obou realitách | fade |

```js
const root = document.querySelector('[data-reveal-root]');
DvaSvetyReveal.init(root, { focus: '#odhaleni-nadpis' }); // fokus na nadpis
DvaSvetyReveal.replay(root);           // „Přehrát odhalení znovu“
```

- První oddíl hraje hned, další až při vstupu do viditelné části (25 %, IntersectionObserver).
- `prefers-reduced-motion: reduce` → nic se nearmuje, obsah je hned v koncovém stavu. Ověřeno.
- Bez JavaScriptu je vidět koncový stav (animace je jen vrstva navíc).
- `data-reveal="fade"` animuje `transform`: nedávej ho na prvek, který má vlastní `transform`.

## Přístupnost

- **Klávesnice**: ouška jsou obyčejná tlačítka (každé je zastávka tabulátoru, bez šipek). Po otevření
  ouška fokus skočí na nadpis listu (`tabindex="-1"`). Po položení otázky na další otázku, případně
  na nadpis. Dialogy jsou nativní `<dialog>`: fokus uvnitř, Esc zavírá, fokus se vrací na spouštěcí
  tlačítko. Při otevření je fokus na nadpisu dialogu, ne na první možnosti.
- **Čtečka**: přepis hovoru má `aria-live="polite"`, takže se ohlásí jen nová odpověď. Historie se
  neohlašuje. Šev, ořezové značky, posunuté otisky a čáry mapy jsou `aria-hidden`. Titulek se soutiskem
  se čte jednou (deska navíc je `aria-hidden`).
- **Focus**: obrys 3 px inkoustem, odsazení 3 px. U oušek dovnitř (−7 px), protože ouško navazuje na list.
- **Cíle dotyku**: ovladače 52 px, nejmenší 44 px.
- **Mobil**: bez vodorovného posunu (ověřeno na 390 px). Reality se čtou svisle ve stejném pořadí
  (nejdřív realita 1, pak realita 2).

## Responzivita

- `> 900 px`: ouška vlevo u listu, okraj spisu vpravo.
- `600–900 px` (tablet, artboardy 768 a 1024): ouška nad listem v mřížce 3 × 2, otevřené ouško splývá
  s listem. Rozhodnutí a mapa původu ve dvou sloupcích pod listem. Od 960 px mohou být ouška zase vlevo.
- `< 600 px`: vše v jednom sloupci, lišta s tlačítkem „Rozhodnout o požadavku“ připnutá ke spodní hraně
  (barva papíru, linka 4 px, žádná plovoucí tmavá lišta).
- Tabulka uloženého průběhu se pod 600 px musí přeskládat na seznam karet (není nakreslené).

## Česká typografie

`typografie(text)` z `utils/typografie.js` použij na každý text z obsahu hry. Zajistí:

- nezlomitelnou mezeru za jednopísmennými předložkami a spojkami (v, k, s, z, o, u, a, i),
- „8 400 Kč“ a „Účet B“ vždy na jednom řádku,
- žádné zalomení za pomlčkou v kódech (JAVOR-014) a ve slově e-mail (vkládá U+2060).

Na atributy, URL a e-mailové adresy funkci nepoužívej.

## Co dodá aplikace (v návrhu v hranatých závorkách)

- čísla účtů A a B (simulovaná), telefon z přílohy (simulovaný), položky objednávky,
- datum a čas v uloženém průběhu,
- skutečná pravidla, co se zapisuje do historie a jak se počítají podklady.

Texty „Princip a omezení“ a „Jak na to“ jsou návrh. Vycházejí ze zadání, ale je potřeba je projít.
Stránka „Princip a omezení“ prozrazuje pointu, proto má nahoře upozornění.

## Co bylo ověřeno

- Všech 19 artboardů B2 je vykreslených (1440, 1024, 768, 390 px). Bez vodorovného posunu a s načtenými písmy.
- `demo/odhaleni.html`: animace se spustí, oddíl 2 se přehraje až po dorolování, při omezení pohybu je
  hned koncový stav, fokus na nadpisu.
- `demo/plocha.html`: ouško 05 je nedostupné, dokud se neotevře příloha. Odpověď se přidá do přepisu,
  „Potvrdit“ se odemkne až po výběru, Esc vrátí fokus na tlačítko. Bez chyb v konzoli.
- Kontrasty v tabulce výše (výpočet podle WCAG 2.1).

Neověřeno: čtečky obrazovky v praxi (NVDA, VoiceOver), Safari a Firefox (ukázky běžely v Chromiu).
