# Použití AI

## Při tvorbě

- **Kód, testy a dokumentace** vznikly s pomocí Claude Code (Anthropic) podle zadání projektu. Autorka zadání a výsledek kontroluje.
- **Texty obou případů** (zprávy, odpovědi, vysvětlení) navrhla AI podle kanonických faktů ze zadání. Druhá jazyková varianta hlavního e-mailu (`v2` v `content/evening.ts`) je také navržená AI.
- **Kontrola variant**: obě varianty obsahují stejná fakta (8 400 Kč, JAVOR-014, příloha, „dnes“) a žádná neobsahuje text ani vodítko patřící jen jedné realitě. To hlídají testy v `engine/rules.test.ts`. Lidská jazyková kontrola textů je na autorce před případným zveřejněním.

## Oddělení textu od pravdy scénáře

Pravdu o realitách drží typovaný model, ne text: který svět platí, jaká tvrzení odpověď nese (`identity_confirmed`, `requested_change_confirmed` …) a jak se vyhodnotí podloženost. Text je jen vykreslení. Pro jeden párový pokus se používá jedna společná varianta zprávy v obou realitách, žádné texty se negenerují zvlášť pro každý svět.

## Při spuštění

Aplikace nevolá žádné AI, nepotřebuje API klíč a nic neodesílá. Rozhraní nikde nepředstírá, že „AI právě analyzuje“. Živé AI ani hlasová ukázka nejsou implementované.
