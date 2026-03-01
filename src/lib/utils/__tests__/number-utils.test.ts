import { describe, it, expect } from 'vitest';
import {
  isStringNumeric,
  parseStringToNumber,
  formatNumberToString,
} from '../number-utils.ts';

describe('isStringNumeric', () => {
  it('should return true for integer', () => {
    expect(isStringNumeric('123')).toBe(true);
  });

  it('should return true for decimal EN (dot)', () => {
    expect(isStringNumeric('123.45')).toBe(true);
  });

  it('should return true for decimal FR (comma)', () => {
    expect(isStringNumeric('123,45')).toBe(true);
  });

  it('should return true for FR thousands with spaces', () => {
    expect(isStringNumeric('1 000 000')).toBe(true);
  });

  it('should return true for EN thousands with commas', () => {
    expect(isStringNumeric('1,000,000.50')).toBe(true);
  });

  it('should return true for FR full format', () => {
    expect(isStringNumeric('1.000.000,50')).toBe(true);
  });

  it('should return true for negative numbers', () => {
    expect(isStringNumeric('-123.45')).toBe(true);
  });

  it('should return false for non-numeric string', () => {
    expect(isStringNumeric('abc')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isStringNumeric('')).toBe(false);
  });

  it('should return false for mixed alpha-numeric', () => {
    expect(isStringNumeric('12abc')).toBe(false);
  });
});

describe('parseStringToNumber', () => {
  it('should parse simple integer', () => {
    expect(parseStringToNumber('123')).toBe(123);
  });

  it('should parse EN decimal', () => {
    expect(parseStringToNumber('123.45')).toBe(123.45);
  });

  it('should parse FR decimal', () => {
    expect(parseStringToNumber('123,45')).toBe(123.45);
  });

  it('should parse FR thousands with spaces', () => {
    expect(parseStringToNumber('1 000 000')).toBe(1000000);
  });

  it('should parse EN thousands with commas and decimal', () => {
    expect(parseStringToNumber('1,000,000.50')).toBe(1000000.5);
  });

  it('should parse FR thousands with dots and comma decimal', () => {
    expect(parseStringToNumber('1.000.000,50')).toBe(1000000.5);
  });

  it('should parse negative numbers', () => {
    expect(parseStringToNumber('-123.45')).toBe(-123.45);
  });

  it('should return null for non-numeric string', () => {
    expect(parseStringToNumber('abc')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(parseStringToNumber('')).toBeNull();
  });

  it('should parse ambiguous 1,000 as FR decimal (1.0) by default', () => {
    // Ambigu : 1,000 pourrait être EN (mille) ou FR (1.0)
    // Choix : FR par défaut — 3 chiffres après virgule unique = ambigu → FR
    expect(parseStringToNumber('1,000')).toBe(1);
  });

  it('should parse multiple comma groups as EN thousands', () => {
    expect(parseStringToNumber('1,000,000')).toBe(1000000);
  });

  it('should parse 1,50 as FR decimal', () => {
    expect(parseStringToNumber('1,50')).toBe(1.5);
  });

  it('should parse 0,5 as FR decimal', () => {
    expect(parseStringToNumber('0,5')).toBe(0.5);
  });
});

describe('formatNumberToString', () => {
  it('should format number in FR locale', () => {
    const result = formatNumberToString(1234.5, 'fr');
    // Intl peut utiliser un espace insécable
    expect(result.replace(/\s/g, ' ')).toContain('1');
    expect(result).toContain(',');
  });

  it('should format number in EN locale', () => {
    const result = formatNumberToString(1234.5, 'en');
    expect(result).toContain('1');
    expect(result).toContain('.');
  });

  it('should default to FR locale', () => {
    const result = formatNumberToString(1234.5);
    expect(result).toContain(',');
  });
});
