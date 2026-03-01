import { describe, it, expect } from 'vitest';
import {
  trimAndNormalizeString,
  removeAccentsFromString,
  normalizeColumnName,
  normalizeColumnNamesWithDeduplication,
  detectSeparatorInString,
  splitStringBySeparator,
} from '../string-utils.ts';

describe('trimAndNormalizeString', () => {
  it('should trim whitespace from strings', () => {
    expect(trimAndNormalizeString('  hello  ')).toBe('hello');
  });

  it('should convert null to empty string', () => {
    expect(trimAndNormalizeString(null)).toBe('');
  });

  it('should convert undefined to empty string', () => {
    expect(trimAndNormalizeString(undefined)).toBe('');
  });

  it('should convert numbers to string', () => {
    expect(trimAndNormalizeString(42)).toBe('42');
  });

  it('should convert boolean to string', () => {
    expect(trimAndNormalizeString(true)).toBe('true');
  });
});

describe('removeAccentsFromString', () => {
  it('should remove accents from French characters', () => {
    expect(removeAccentsFromString('éàü')).toBe('eau');
  });

  it('should handle strings without accents', () => {
    expect(removeAccentsFromString('hello')).toBe('hello');
  });

  it('should handle mixed accented and plain characters', () => {
    expect(removeAccentsFromString('Prénom')).toBe('Prenom');
  });
});

describe('normalizeColumnName', () => {
  it('should lowercase and remove accents', () => {
    expect(normalizeColumnName('Prénom')).toBe('prenom');
  });

  it('should convert apostrophes to underscores', () => {
    expect(normalizeColumnName("Date d'inscription")).toBe('date_d_inscription');
  });

  it('should convert spaces and hyphens to underscores', () => {
    expect(normalizeColumnName('Email Address')).toBe('email_address');
  });

  it('should remove special characters', () => {
    expect(normalizeColumnName('nom@#$%')).toBe('nom');
  });

  it('should deduplicate consecutive underscores', () => {
    expect(normalizeColumnName('nom   prénom')).toBe('nom_prenom');
  });

  it('should handle complex column names', () => {
    expect(normalizeColumnName("N° d'adhérent")).toBe('n_d_adherent');
  });
});

describe('normalizeColumnNamesWithDeduplication', () => {
  it('should normalize all names', () => {
    const result = normalizeColumnNamesWithDeduplication(['Prénom', 'Email Address']);
    expect(result).toEqual(['prenom', 'email_address']);
  });

  it('should add suffix for duplicate normalized names', () => {
    const result = normalizeColumnNamesWithDeduplication(['Nom', 'NOM', 'nom']);
    expect(result).toEqual(['nom', 'nom_2', 'nom_3']);
  });

  it('should handle empty array', () => {
    expect(normalizeColumnNamesWithDeduplication([])).toEqual([]);
  });
});

describe('detectSeparatorInString', () => {
  it('should detect pipe separator', () => {
    expect(detectSeparatorInString('sport|musique|cinema')).toBe('|');
  });

  it('should detect comma separator', () => {
    expect(detectSeparatorInString('sport,musique,cinema')).toBe(',');
  });

  it('should detect semicolon separator', () => {
    expect(detectSeparatorInString('sport;musique;cinema')).toBe(';');
  });

  it('should prioritize pipe over comma', () => {
    expect(detectSeparatorInString('a|b,c')).toBe('|');
  });

  it('should return null when no separator found', () => {
    expect(detectSeparatorInString('hello world')).toBeNull();
  });
});

describe('splitStringBySeparator', () => {
  it('should split by pipe and trim values', () => {
    expect(splitStringBySeparator('sport | musique | cinema', '|')).toEqual([
      'sport',
      'musique',
      'cinema',
    ]);
  });

  it('should filter empty values after split', () => {
    expect(splitStringBySeparator('sport||cinema', '|')).toEqual(['sport', 'cinema']);
  });

  it('should handle single value without separator', () => {
    expect(splitStringBySeparator('sport', '|')).toEqual(['sport']);
  });
});
