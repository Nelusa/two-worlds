const NBSP = " ";
const WORD_JOINER = "⁠";

/**
 * Czech typesetting for text from the case content (design/b2/utils/typografie.js).
 * Keeps one-letter prepositions with the next word, numbers with their units, "Účet B" together,
 * and stops line breaks after the hyphen in codes like JAVOR-014 and in "e-mail".
 * Apply it where the text is rendered, never to data, attributes, URLs or e-mail addresses.
 */
export function typography(text: string): string {
  return text
    .replace(/(\d) (?=\d{3}\b)/g, `$1${NBSP}`)
    .replace(/(\d) (?=(Kč|EUR|€|%|ks|min|h)(?![\p{L}\d]))/gu, `$1${NBSP}`)
    .replace(/(?<![\p{L}])(Účet|účet|Účtu|účtu|Účtem|účtem) ([A-Z])(?![\p{L}\d])/gu, `$1${NBSP}$2`)
    .replace(/\b([A-ZÁ-Ž]{2,})-(\d+)\b/g, `$1-${WORD_JOINER}$2`)
    .replace(/\be-mail/g, `e-${WORD_JOINER}mail`)
    .replace(/(^|[\s(„])([vVkKsSzZoOuUaAiI]) (?=\S)/gu, `$1$2${NBSP}`);
}
