import { describe, it, expect } from 'vitest';
import {
  convertExcelDateToISOString,
  parseDateStringToDateObject,
  formatDateObjectToString,
  isValidDateString,
  detectDateFormatFromString,
} from '../date-utils.ts';

describe('convertExcelDateToISOString', () => {
  it('should convert a valid Date to ISO string', () => {
    const date = new Date(2024, 0, 15);
    expect(convertExcelDateToISOString(date)).toBe('2024-01-15');
  });

  it('should return empty string for null', () => {
    expect(convertExcelDateToISOString(null)).toBe('');
  });

  it('should return empty string for invalid Date', () => {
    expect(convertExcelDateToISOString(new Date('invalid'))).toBe('');
  });

  it('should zero-pad month and day', () => {
    const date = new Date(2024, 2, 5);
    expect(convertExcelDateToISOString(date)).toBe('2024-03-05');
  });
});

describe('detectDateFormatFromString', () => {
  it('should detect YYYY-MM-DD format', () => {
    expect(detectDateFormatFromString('2024-01-15')).toBe('YYYY-MM-DD');
  });

  it('should detect YYYY/MM/DD format as YYYY-MM-DD', () => {
    expect(detectDateFormatFromString('2024/01/15')).toBe('YYYY-MM-DD');
  });

  it('should detect DD/MM/YYYY when first number > 12', () => {
    expect(detectDateFormatFromString('25/01/2024')).toBe('DD/MM/YYYY');
  });

  it('should detect MM/DD/YYYY when second number > 12', () => {
    expect(detectDateFormatFromString('01/25/2024')).toBe('MM/DD/YYYY');
  });

  it('should default to DD/MM/YYYY for ambiguous dates (French default)', () => {
    expect(detectDateFormatFromString('05/06/2024')).toBe('DD/MM/YYYY');
  });

  it('should detect DD-MM-YYYY with hyphens', () => {
    expect(detectDateFormatFromString('25-01-2024')).toBe('DD/MM/YYYY');
  });

  it('should return null for non-date strings', () => {
    expect(detectDateFormatFromString('not-a-date')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(detectDateFormatFromString('')).toBeNull();
  });
});

describe('parseDateStringToDateObject', () => {
  it('should parse ISO format (YYYY-MM-DD)', () => {
    const date = parseDateStringToDateObject('2024-01-15');
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getDate()).toBe(15);
  });

  it('should parse French format (DD/MM/YYYY)', () => {
    const date = parseDateStringToDateObject('15/01/2024', 'DD/MM/YYYY');
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getDate()).toBe(15);
  });

  it('should parse US format (MM/DD/YYYY)', () => {
    const date = parseDateStringToDateObject('01/15/2024', 'MM/DD/YYYY');
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getDate()).toBe(15);
  });

  it('should auto-detect format when not provided', () => {
    const date = parseDateStringToDateObject('2024-03-20');
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(2);
    expect(date?.getDate()).toBe(20);
  });

  it('should return null for invalid date 31/02/2024', () => {
    expect(parseDateStringToDateObject('31/02/2024', 'DD/MM/YYYY')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(parseDateStringToDateObject('')).toBeNull();
  });

  it('should return null for non-date string', () => {
    expect(parseDateStringToDateObject('hello')).toBeNull();
  });

  it('should reject year outside 1900-2100 range', () => {
    expect(parseDateStringToDateObject('1800-01-01')).toBeNull();
    expect(parseDateStringToDateObject('2200-01-01')).toBeNull();
  });

  it('should parse date with hyphens in DD-MM-YYYY format', () => {
    const date = parseDateStringToDateObject('15-01-2024', 'DD/MM/YYYY');
    expect(date).toBeInstanceOf(Date);
    expect(date?.getDate()).toBe(15);
  });
});

describe('formatDateObjectToString', () => {
  it('should format to YYYY-MM-DD', () => {
    const date = new Date(2024, 0, 15);
    expect(formatDateObjectToString(date, 'YYYY-MM-DD')).toBe('2024-01-15');
  });

  it('should format to DD/MM/YYYY', () => {
    const date = new Date(2024, 0, 15);
    expect(formatDateObjectToString(date, 'DD/MM/YYYY')).toBe('15/01/2024');
  });

  it('should format to MM/DD/YYYY', () => {
    const date = new Date(2024, 0, 15);
    expect(formatDateObjectToString(date, 'MM/DD/YYYY')).toBe('01/15/2024');
  });

  it('should zero-pad single digit months and days', () => {
    const date = new Date(2024, 2, 5);
    expect(formatDateObjectToString(date, 'DD/MM/YYYY')).toBe('05/03/2024');
  });
});

describe('isValidDateString', () => {
  it('should return true for valid ISO date', () => {
    expect(isValidDateString('2024-01-15')).toBe(true);
  });

  it('should return true for valid French date', () => {
    expect(isValidDateString('15/01/2024')).toBe(true);
  });

  it('should return false for invalid date (31/02)', () => {
    expect(isValidDateString('31/02/2024')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidDateString('')).toBe(false);
  });

  it('should return false for non-date string', () => {
    expect(isValidDateString('abc')).toBe(false);
  });

  it('should return false for partial date string', () => {
    expect(isValidDateString('2024-01')).toBe(false);
  });
});
