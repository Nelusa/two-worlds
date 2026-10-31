# Demonstrační scénář (přibližně 90 sekund)

**Připravená ukázka.** Běží v ukázkovém režimu s předem zvolenou realitou, nejde o samostatný výkon hráče. Časy jsou orientační, neměřené.

Příprava: otevřít `https://dva-svety.vercel.app/demo?world=fraudulent&variant=v1&contact=available&transferWorld=legitimate`, případně lokálně po `npm run dev` `http://localhost:3021/demo?world=fraudulent&variant=v1&contact=available&transferWorld=legitimate`.

| Čas | Kliknutí | Co říct |
| --- | --- | --- |
| 0:00 | „Spustit ukázku“ | „Organizujete komunitní večer. Dodavatelka píše, že změnila účet a záloha musí odejít dnes. Zpráva vypadá úplně normálně.“ |
| 0:10 | Příloha `nove-udaje-JAVOR-014.pdf` | „Příloha sedí: objednávka, částka, nový Účet B a telefon pro dotazy.“ |
| 0:18 | „Adam, kolega“ → „Zeptat se Adama“ | „Kolega to potvrzuje. Jenže čte stejný e-mail.“ |
| 0:25 | „Kontakt z přílohy“ → „Zavolat na číslo z přílohy“ | „I telefon z přílohy říká: plaťte na Účet B. Máme tři souhlasy.“ |
| 0:32 | Ukázat „Mapa původu“ | „Mapa ukáže, že všechny tři vycházejí z jedné zprávy. Jeden zdroj, ne tři.“ |
| 0:40 | „Uložený kontakt Kláry“ → „Zavolat a zeptat se: platí pro JAVOR-014 záloha 8 400 Kč na Účet B?“ | „Teď jinou cestou: kontakt uložený před třemi týdny a konkrétní otázka na částku a účet.“ |
| 0:50 | „Rozhodnout o požadavku“ → „Odmítnout změnu“ → „Potvrdit rozhodnutí“ | „Rozhodnutí je vlastní a uzamkne pokus.“ |
| 0:55 | „Ukázat vše najednou“ | „A tady je jádro: stejná zpráva ve dvou realitách. V jedné změna platí, v druhé schránku ovládá útočník.“ |
| 1:05 | Sjet na „2. Tvoje úkony v obou realitách“ | „Příloha, Adam i číslo z přílohy odpovídají v obou realitách stejně. Liší se až odpověď přes uložený kontakt: Tady se získané informace rozcházejí.“ |
| 1:15 | „3. Rozhodnutí a důsledky“ | „Aplikace hodnotí odděleně důsledek a podloženost. Rozhodnutí z jedné reality do druhé nepřenáší, nabídne pokračování větve.“ |
| 1:25 | „Pokračovat v této větvi“ | „V druhé realitě by stejný hovor změnu potvrdil a správně by se zaplatilo. Cílem není odmítat, ale ověřit.“ |

Varianta pro nedostupný kontakt: v URL `contact=unreachable`, v kroku 0:40 přijde „Kontakt se zatím nepodařilo zastihnout“, rozhodnutí „Zatím počkat“ dostane hodnocení „Přiměřené odložení“.
