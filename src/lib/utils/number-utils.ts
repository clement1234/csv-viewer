/**
 * Détecte si une string représente un nombre (formats FR et EN).
 *
 * Formats supportés :
 * - Entiers : 123, -123
 * - Décimaux EN : 123.45
 * - Décimaux FR : 123,45
 * - Milliers EN : 1,000,000.50
 * - Milliers FR : 1.000.000,50 ou 1 000 000,50
 */
export function isStringNumeric(value: string): boolean {
  return parseStringToNumber(value) !== null;
}

export function parseStringToNumber(value: string): number | null {
  if (!value || value.trim() === '') return null;

  const trimmed = value.trim();
  const normalized = normalizeNumericString(trimmed);
  if (normalized === null) return null;

  const parsed = Number(normalized);
  if (isNaN(parsed) || !isFinite(parsed)) return null;
  return parsed;
}

function normalizeNumericString(value: string): string | null {
  // Retirer les espaces (séparateurs de milliers FR)
  let cleaned = value.replace(/\s/g, '');

  // Vérifier qu'il ne reste que des chiffres, virgules, points, signe négatif
  if (!/^-?[\d.,]+$/.test(cleaned)) return null;

  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    const lastCommaIndex = cleaned.lastIndexOf(',');
    const lastDotIndex = cleaned.lastIndexOf('.');

    if (lastDotIndex > lastCommaIndex) {
      // Format EN : 1,000.50 → virgules = milliers, point = décimal
      cleaned = cleaned.replace(/,/g, '');
    } else {
      // Format FR : 1.000,50 → points = milliers, virgule = décimal
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
  } else if (hasComma) {
    const commaCount = (cleaned.match(/,/g) ?? []).length;

    if (commaCount > 1) {
      // Plusieurs virgules séparant des groupes → EN milliers : 1,000,000
      cleaned = cleaned.replace(/,/g, '');
    } else {
      // Une seule virgule
      const afterComma = cleaned.split(',')[1];
      if (afterComma.length === 3) {
        // Ambigu (ex: 1,000) → défaut FR : traiter comme décimal
        cleaned = cleaned.replace(',', '.');
      } else {
        // FR décimal : 1,50 ou 123,45
        cleaned = cleaned.replace(',', '.');
      }
    }
  }
  // Si uniquement des points → format EN (pas de transformation nécessaire)

  return cleaned;
}

export function formatNumberToString(
  value: number,
  locale: 'fr' | 'en' = 'fr',
): string {
  const localeString = locale === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.NumberFormat(localeString).format(value);
}
