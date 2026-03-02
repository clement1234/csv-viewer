import { describe, it, expect } from 'vitest';
import { validateConfigAndReturnResult } from '../config-validator.ts';

describe('validateConfigAndReturnResult', () => {
  it('should validate a minimal empty config', () => {
    const result = validateConfigAndReturnResult({});
    expect(result.isValid).toBe(true);
    expect(result.config).toEqual({});
  });

  it('should validate a complete valid config', () => {
    const rawConfig = {
      app: { title: 'Mon App', subtitle: 'Description' },
      csv: { delimiter: ';' },
      match: { expectedHeaders: ['nom', 'prenom'], strictMode: false },
      columns: {
        defaultVisible: ['nom', 'prenom'],
        labels: { nom: 'Nom de famille' },
        aliases: { name: 'nom' },
      },
      filters: {
        globalSearchColumns: ['nom'],
        dropdown: ['statut'],
        text: ['nom'],
      },
    };
    const result = validateConfigAndReturnResult(rawConfig);
    expect(result.isValid).toBe(true);
    expect(result.config?.app?.title).toBe('Mon App');
  });

  it('should reject non-object config', () => {
    const result = validateConfigAndReturnResult('not an object');
    expect(result.isValid).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('should reject null config', () => {
    const result = validateConfigAndReturnResult(null);
    expect(result.isValid).toBe(false);
  });

  it('should report error for invalid app.title type', () => {
    const result = validateConfigAndReturnResult({ app: { title: 123 } });
    expect(result.isValid).toBe(false);
    expect(result.errors?.some((e) => e.includes('title'))).toBe(true);
  });

  it('should report error for unknown top-level keys', () => {
    const result = validateConfigAndReturnResult({ unknownKey: 'value' });
    expect(result.isValid).toBe(false);
    expect(result.errors?.some((e) => e.includes('unknownKey'))).toBe(true);
  });

  it('should validate column format config with badge type', () => {
    const rawConfig = {
      columns: {
        formats: {
          statut: {
            type: 'badge',
            map: { actif: { color: 'green', variant: 'solid' } },
          },
        },
      },
    };
    const result = validateConfigAndReturnResult(rawConfig);
    expect(result.isValid).toBe(true);
  });

  it('should validate column format config with date type', () => {
    const rawConfig = {
      columns: {
        formats: {
          date_inscription: {
            type: 'date',
            inputFormat: 'DD/MM/YYYY',
            outputFormat: 'YYYY-MM-DD',
          },
        },
      },
    };
    const result = validateConfigAndReturnResult(rawConfig);
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid column format type', () => {
    const rawConfig = {
      columns: {
        formats: {
          col: { type: 'invalid_type' },
        },
      },
    };
    const result = validateConfigAndReturnResult(rawConfig);
    expect(result.isValid).toBe(false);
  });

  it('should validate stats config', () => {
    const rawConfig = {
      stats: {
        cards: [
          { type: 'count', label: 'Total' },
          { type: 'countWhere', label: 'Actifs', column: 'statut', value: 'actif' },
        ],
        panels: [
          { type: 'countByColumn', column: 'statut', label: 'Par statut' },
        ],
      },
    };
    const result = validateConfigAndReturnResult(rawConfig);
    expect(result.isValid).toBe(true);
  });

  it('should validate detailModal config', () => {
    const rawConfig = {
      detailModal: {
        titleTemplate: '{nom} {prenom}',
        sections: [{ title: 'Identité', fields: ['nom', 'prenom'] }],
      },
    };
    const result = validateConfigAndReturnResult(rawConfig);
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid filters config type', () => {
    const result = validateConfigAndReturnResult({ filters: { dropdown: 'not_array' } });
    expect(result.isValid).toBe(false);
  });
});
