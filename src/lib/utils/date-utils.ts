import type { DateFormat } from '../../types/config.types.ts';

const ISO_DATE_PATTERN = /^\d{4}[-/]\d{2}[-/]\d{2}$/;
const DMY_DATE_PATTERN = /^\d{2}[-/]\d{2}[-/]\d{4}$/;

const MIN_VALID_YEAR = 1900;
const MAX_VALID_YEAR = 2100;

function isValidDateObject(date: Date): boolean {
  return !isNaN(date.getTime());
}

function zeroPad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Vérifie que le jour correspond bien au mois (évite les dates comme 31/02) */
function isConsistentDate(year: number, month: number, day: number): boolean {
  if (year < MIN_VALID_YEAR || year > MAX_VALID_YEAR) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function convertExcelDateToISOString(date: Date | null): string {
  if (date === null || !isValidDateObject(date)) return '';
  const year = date.getFullYear();
  const month = zeroPad(date.getMonth() + 1);
  const day = zeroPad(date.getDate());
  return `${year}-${month}-${day}`;
}

export function detectDateFormatFromString(str: string): DateFormat | null {
  if (ISO_DATE_PATTERN.test(str)) return 'YYYY-MM-DD';

  if (DMY_DATE_PATTERN.test(str)) {
    const parts = str.split(/[-/]/);
    const firstNumber = parseInt(parts[0], 10);
    const secondNumber = parseInt(parts[1], 10);

    if (firstNumber > 12) return 'DD/MM/YYYY';
    if (secondNumber > 12) return 'MM/DD/YYYY';

    // Ambigu → défaut français
    return 'DD/MM/YYYY';
  }

  return null;
}

export function parseDateStringToDateObject(
  str: string,
  format?: DateFormat,
): Date | null {
  if (!str || str.trim() === '') return null;

  const detectedFormat = format ?? detectDateFormatFromString(str);
  if (!detectedFormat) return null;

  const parts = str.split(/[-/]/);
  if (parts.length !== 3) return null;

  let year: number;
  let month: number;
  let day: number;

  switch (detectedFormat) {
    case 'YYYY-MM-DD':
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
      break;
    case 'DD/MM/YYYY':
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
      break;
    case 'MM/DD/YYYY':
      month = parseInt(parts[0], 10);
      day = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
      break;
  }

  if (!isConsistentDate(year, month, day)) return null;

  return new Date(year, month - 1, day);
}

export function formatDateObjectToString(date: Date, format: DateFormat): string {
  const year = date.getFullYear();
  const month = zeroPad(date.getMonth() + 1);
  const day = zeroPad(date.getDate());

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
  }
}

export function isValidDateString(str: string): boolean {
  return parseDateStringToDateObject(str) !== null;
}
