# Zadání pro Claude Code: nový vizuál Dva světy (směr B2)

Tento soubor čte Claude Code. Popisuje, co v repozitáři aplikace „Dva světy“ změnit, v jakém pořadí
a podle čeho poznáš, že je hotovo. Podrobnosti k tokenům, komponentám, animaci a přístupnosti jsou
v `README.md` ve stejné složce. Vzhled jednotlivých obrazovek ukazují PNG v `screens/`.

## Cíl

Nahradit současný vizuál aplikace (Fraunces + Inter, karty se zaoblením) směrem B2
„Soutisk se spisem“. **Logiku hry, obsah případu, texty a datový model neměň.** Měníš jen
vzhled, strukturu značek kvůli přístupnosti a chování ovladačů popsané níže. Když narazíš na
rozpor mezi návrhem a tím, jak aplikace funguje, zachovej chování aplikace a rozpor vypiš.

## Postup

1. **Prozkoumej repozitář dřív, než cokoli změníš.** Zjisti framework, kde jsou styly, komponenty
   obrazovek, data případu, ukládání průběhu a testy. Napiš krátký plán a mapu „současná komponenta
   → komponenta B2“. Pokud složka `design/b2/` (tento balíček) není v repozitáři, zeptej se, kde je.
2. **Základ:** zkopíruj `fonts/` do veřejných statických souborů aplikace (písma se načítají jen
   lokálně, žádný Google Fonts), převezmi `tokens/tokens.css` a `components/components.css`.
   Pokud projekt používá jiný systém stylů (CSS moduly, Tailwind, styled-components), převeď tokeny
   do něj, ale zachovej názvy a hodnoty. Odstraň staré tokeny a písma, až nebudou nikde použité.
3. **Obrazovky v tomto pořadí** (vzor v `screens/`):

   | pořadí | obrazovka | vzor |
   |---|---|---|
   | 1 | hlavička, patička, úvod | `01-uvod-1440.png`, `01-uvod-390.png` |
   | 2 | pracovní plocha: ouška, list, okraj spisu, historie | `02-…`, `03-…` (1440, 1024, 768, 390) |
   | 3 | obsah všech listů podkladů a jejich stavy | `04-listy-podkladu.png` |
   | 4 | nápověda „Jak na to“ | `05-jak-na-to-1440.png` |
   | 5 | dialog rozhodnutí | `06-rozhodnuti-1440.png`, `06-rozhodnuti-390.png` |
   | 6 | odhalení včetně animace (`reveal/`) | `07-odhaleni-1440.png`, `07-odhaleni-390.png` |
   | 7 | pokračování ve větvi | `08-vetev-1440.png` |
   | 8 | sestavení vlastního postupu | `09-vlastni-postup-1440.png` |
   | 9 | Princip a omezení, Uložený průběh | `10-…`, `11-…` |
   | 10 | stavy ovladačů, klávesnice, čtečka | `12-stavy-klavesnice-ctecka.png` |

   Pracuj po obrazovkách a po každé ověř výsledek v prohlížeči proti PNG (ideálně snímkem obrazovky
   v 1440 a 390 px). Funkční vzor chování je v `demo/plocha.html` a `demo/odhaleni.html`.
4. **Texty** z obsahu případu prožeň funkcí `typografie()` z `utils/typografie.js` (nebo jejím
   ekvivalentem v jazyce projektu) v místě, kde se text vykresluje. Ne v datech.
5. **Testy:** spusť existující testy projektu, nic z nich nesmí přestat procházet. Přidej kontroly
   z části „Hotovo, když“, pokud projekt má e2e nebo komponentové testy.

## Pevná pravidla

- **Před rozhodnutím nesmí nic prozradit realitu.** Barvy `--plate-1` a `--plate-2` a jejich plochy
  se používají jen v odhalení, ve větvi a u záznamů uloženého průběhu po odhalení. Do rozhodnutí je
  všechno jen papír a inkoust. Logo: `icons/logo-pred-rozhodnutim.svg`, po rozhodnutí
  `logo-po-rozhodnuti.svg`.
- Realita je vždy pojmenovaná slovy. Barva nikdy nenese informaci sama.
- Žádné skóre, body, procenta, odpočet ani hodnotící věty. Žádná zelená = správně, červená = špatně.
- Rozhodnutí: tři rovnocenné přepínače v pevném pořadí, nic předvybraného, „Potvrdit“ je
  `aria-disabled`, dokud není nic vybráno. Tlačítko „Rozhodnout o požadavku“ je dostupné kdykoli.
- Žádné zaoblení, stíny, gradienty, kapitálkové štítky, odznaky ve tvaru pilulky, ikony v kolečku
  ani plovoucí tmavá lišta.
- Volby s jednou odpovědí jsou přepínače, s více odpověďmi zaškrtávací políčka.
- Ikony jen z `icons/`, vždy vedle slova. Šipku „→“ nepiš jako znak, písma ji nemají; použij `sipka.svg`.

## Odchylky návrhu od současné aplikace (rozhodni podle aplikace)

- Historie úkonů v návrhu má 4 úkony (příloha, Adam, číslo z přílohy, ověření přes uložený kontakt)
  a odhalení se rozchází na úkonu 4. Pokud aplikace zapisuje do historie i otevření uložené karty
  a ověření totožnosti, zachovej aplikaci; vzhled řádků zůstává stejný.
- Údaje v hranatých závorkách v PNG (čísla účtů, telefon z přílohy, položky objednávky, datum
  v uloženém průběhu) ber z dat aplikace.
- Texty „Jak na to“ a „Princip a omezení“ v návrhu jsou koncept. Pokud aplikace má vlastní, použij je.
- Mobilní podoba tabulky „Uložený průběh“ (pod 600 px) není nakreslená: přeskládej ji na seznam
  stejně stylovaných řádků (název, realita, rozhodnutí, tlačítko na celou šířku).

## Hotovo, když

- [ ] Na 390 px žádná obrazovka nemá vodorovný posun stránky.
- [ ] Před potvrzením rozhodnutí se v DOM ani CSS stránky nepoužije `--plate-1` / `--plate-2`.
- [ ] Ouška se ovládají tabulátorem a Enterem, po otevření je fokus na nadpisu listu.
- [ ] Nedostupné ouško (Kontakt z přílohy) má `aria-disabled="true"` a vysvětlení slovy.
- [ ] Přepis hovoru ohlásí jen novou odpověď (`aria-live="polite"`).
- [ ] Dialog rozhodnutí: fokus na nadpisu, Esc zavírá, fokus se vrací na spouštěcí tlačítko.
- [ ] Odhalení: při `prefers-reduced-motion: reduce` je hned koncový stav, bez JS také.
      Oddíly 2 a 3 se přehrají až při dorolování. Fokus po vstupu na nadpis „Dvě reality“.
- [ ] Obě reality a obě buňky úkonu 4 se v animaci objevují současně.
- [ ] Viditelný focus u všech ovladačů (3 px, odsazení 3 px), cíle dotyku aspoň 44 px.
- [ ] Písma se načítají z vlastních souborů, žádný požadavek na fonts.googleapis.com.
- [ ] Existující testy procházejí.

Na konci shrň, co se změnilo, co zůstalo podle aplikace místo podle návrhu a co jsi neověřil/a.
