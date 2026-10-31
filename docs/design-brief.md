# Zadání pro Claude Design: Dva světy

Navrhni prosím 2 až 3 výrazně odlišné vizuální směry pro webovou aplikaci Dva světy. Každý směr ukaž na třech obrazovkách (úvod, pracovní plocha, odhalení) v šířce 1440 px a 390 px. Jde o průzkum: aplikace už funguje, logiku a obsah neměň, hledám vizuální jazyk, který bude zapamatovatelný a nebude působit jako typická AI aplikace.

Přikládám screenshoty současného stavu (`01-intro-desktop.png`, `02-workspace-desktop.png`, `03-reveal-desktop.png` a mobilní `10` až `12`). Ber je jako výchozí bod, ne jako vzor ke kopírování.

## O co jde

Krátký interaktivní detektivní příběh pro lidi, kteří v malých firmách a spolcích vyřizují požadavky dodavatelů. Hráči přijde e-mail od dodavatelky: změnili účet, ať zálohu 8 400 Kč pošle ještě dnes na nový. Hráč otevírá podklady, volá kontakty a rozhodne se (odsouhlasit, odmítnout, počkat). Pak uvidí dvě připravené reality se stejnou zprávou: v jedné je změna skutečná, ve druhé schránku dodavatelky zneužil někdo cizí. Ukáže se, co by jeho kroky přinesly v obou a kde se získané informace rozešly.

Pointa: **Stejná zpráva. Dvě reality. Rozhoduje, jak ji ověříš.** Zprávu, přílohu ani kolegu, který četl totéž, nejde použít jako ověření. Rozhoduje až konkrétní otázka přes kontakt uložený dřív.

## Co zachovat

- **Šev mezi dvěma světy** jako podpisový prvek. Na úvodu jsou dvě poloviny a zpráva leží přes šev. V odhalení stejné odpovědi šev překlenou jednou kartou a v místě rozdílu se řádek rozevře do dvou polovin.
- **Pocit kvalitně zpracované složky případu**, ne dashboardu. List s otevřeným podkladem je hlavní objekt obrazovky.
- Česky, s diakritikou. Všechny osoby, firmy a kontakty jsou smyšlené (doména `.example`).

## Obrazovky a jejich obsah

### 1. Úvod
- Název „Dva světy“, věta „Když všechno působí důvěryhodně, co si ověříš?“, krátký popis, tlačítko „Otevřít případ“, odkaz „Jak to funguje“.
- Ukázka zprávy: od Klára &lt;klara@javor.example&gt;, Dnes 16:42, předmět „Zítřejší dodání: změna platebních údajů“, začátek textu „Ahoj, jen prosím o úhradu zálohy 8 400 Kč k objednávce JAVOR-014 ještě dnes. Změnili jsme účet, nové údaje posílám v příloze…“
- Tři kroky hry: Prozkoumej podklady, Rozhodni se, Uvidíš obě reality.
- Malá poznámka, že jde o simulaci a nic se neodesílá.

### 2. Pracovní plocha případu „Večer, který se má uskutečnit“
- Hlavička: Případ 1, název, kontext („Zítra pořádáš komunitní večer. Dodavatel má ráno přivézt vybavení. Zbývá vyřešit zálohu a potvrdit dodání. Právě přišla nová zpráva.“), hodiny příběhu 16:42, odkaz „Jak na to“.
- Seznam šesti podkladů se stavem (Přečteno, Neotevřeno, 1 odpověď, Nejprve potřebuješ podklad): Nová zpráva, Nová příloha, Původní objednávka, Adam (kolega), Kontakt z přílohy, Uložený kontakt Kláry.
- Hlavní list. Navrhni prosím dva stavy:
  - e-mail s přílohou `nove-udaje-JAVOR-014.pdf`,
  - uložený kontakt Kláry (karta: Telefon 000 555 101 (simulovaný), Uloženo při původní objednávce, před třemi týdny) a přepis hovoru: otázka „Platí pro JAVOR-014 záloha 8 400 Kč na Účet B?“, odpověď „Ne, účet jsme neměnili. Pro JAVOR-014 dál platí Účet A. Na Účet B nic neposílej.“ a další možná otázka jako tlačítko.
- Mapa původu: dvě skupiny. „Vychází z nové zprávy“ (zpráva, z ní příloha a odpověď Adama, z přílohy odpověď na čísle z přílohy), u ní „4 podklady, jeden původ“. „Vychází z dřívějších záznamů“ (uložená karta, z ní hovor). Každá vazba má i slovní popis, např. „Číslo převzaté z přílohy“.
- Historie úkonů jako časová osa.
- Rozhodnutí: tlačítko „Rozhodnout o požadavku“, dostupné kdykoli, ale nesmí tlačit k odsouhlasení.

### 3. Odhalení „Dvě reality“
- Krok 1: stejná zpráva, pod ní dvě reality: „Klára účet opravdu změnila“ a „Schránka dodavatele je zneužitá“, u každé kdo zprávu ve skutečnosti poslal a co platí. Označení „Tady proběhl tvůj pokus“.
- Krok 2: úkony hráče řádek po řádku. Řádky 1 až 3 jsou v obou realitách stejné (jedna karta přes šev), řádek 4 se rozchází: vlevo „Ano, k JAVOR-014 platí záloha 8 400 Kč a nový Účet B.“, vpravo „Ne, účet jsme neměnili…“. Nad ním „Tady se získané informace rozcházejí“.
- Krok 3: důsledky v obou realitách, „Podložené odmítnutí“ s krátkým vysvětlením, předpoklad modelu jako poznámka, tlačítko „Pokračovat v této větvi“.
- Ukaž prosím i, jak by odhalení vypadalo v pohybu (popis nebo sekvence snímků): postupné otevírání švu.

## Co chci prozkoumat

1. **Vlastní vizuální motiv**: jednu ilustraci nebo grafický prvek k pointě (např. rozdělený dopis, dva překrývající se listy, šev jako stopa). Žádné generické fotky ani 3D.
2. **Jednotnou sadu ikon**, nebo návrh, kde ikony nejsou potřeba.
3. **Barvy a typografii**: současná paleta (teplé světlé pozadí `#F4F1EA`, inkoustová `#17272B`, teal `#1E706C`, měď `#B96748`) a písma Fraunces a Inter jsou výchozí. Klidně navrhni výraznější kombinaci.
4. **Choreografii odhalení**: jak se šev otevírá, co přijde první, co je velký okamžik.

## Pevná omezení

- **Před rozhodnutím nesmí nic prozradit realitu.** Žádná barva, ikona ani text nesmí naznačovat, který zdroj je pravý. Teal a měď se jako barvy realit objevují až v odhalení. Žádná univerzální zelená pro „správně“ a červená pro „špatně“.
- **Bez hodnocení hráče**: žádné skóre, body, procenta, odpočet času ani věty typu „Nalétl jsi!“.
- **Přístupnost**: kontrast textu aspoň 4,5 : 1, viditelný focus, ovladače velké aspoň 24 px, nic jen barvou. Animace musí jít vypnout (reduced motion) a obsah musí fungovat i bez nich.
- **Mobil 390 px** bez vodorovného posunu celé stránky. Srovnání realit se tam čte svisle ve stejném pořadí.
- **Písma** jen s volnou licencí, která se dají přibalit k aplikaci (žádné načítání z cizího serveru).
- Volby s jednou odpovědí vypadají jako přepínače, volby s více odpověďmi jako zaškrtávací políčka.

## Čemu se vyhnout

Typické znaky AI aplikací, které jsme už odstraňovali: všechno v zaoblených kartách, karty v kartách, kapitálkové štítky nad vším, tabletkovitá tlačítka a odznaky, ikona v kolečku u každého řádku, tečkované pozadí, gradienty, neon, dekorativní kruhy, plovoucí tmavá lišta, chatové bubliny, dekorativní statistiky.

## Co od tebe potřebuji

Pro každý směr:
- tři obrazovky v 1440 px a 390 px,
- barvy, písma, velikosti a zaoblení jako jednoduchý seznam tokenů,
- dvě až tři věty, proč směr funguje pro tuhle pointu,
- popis pohybu při odhalení.
