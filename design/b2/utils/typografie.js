/* Dva světy · česká typografie pro texty z obsahu hry.
   Použij na každý řetězec, který jde do UI (ne na atributy, URL a e-mailové adresy).
     typografie('Pošli 8 400 Kč na Účet B v příloze.')  →  s nezlomitelnými mezerami
   Pravidla:
   1. Jednopísmenné předložky a spojky (v, k, s, z, o, u, a, i) nezůstávají na konci řádku.
   2. Číslo a jednotka/měna drží pohromadě (8 400 Kč), stejně jako mezery uvnitř čísla.
   3. „Účet A“, „Účet B“ se nedělí.
   4. Kódy s pomlčkou (JAVOR-014) a slovo e-mail se nelámou za pomlčkou (word joiner U+2060). */
(function (global) {
  'use strict';
  var NB = ' ', WJ = '⁠';
  function typografie(text) {
    if (typeof text !== 'string' || !text) return text;
    return text
      .replace(/(\d) (?=\d{3}\b)/g, '$1' + NB)                       // 8 400
      .replace(/(\d) (?=(Kč|EUR|€|%|ks|min|h)(?![\p{L}\d]))/gu, '$1' + NB) // 8 400 Kč
      .replace(/(?<![\p{L}])(Účet|účet|Účtu|účtu|Účtem|účtem) ([A-Z])(?![\p{L}\d])/gu, '$1' + NB + '$2')
      .replace(/\b([A-ZÁ-Ž]{2,})-(\d+)\b/g, '$1-' + WJ + '$2')        // JAVOR-014
      .replace(/\be-mail/g, 'e-' + WJ + 'mail')
      .replace(/(^|[\s(„])([vVkKsSzZoOuUaAiI]) (?=\S)/gu, '$1$2' + NB); // v příloze
  }
  global.typografie = typografie;
  if (typeof module !== 'undefined' && module.exports) module.exports = typografie;
})(typeof window !== 'undefined' ? window : globalThis);
