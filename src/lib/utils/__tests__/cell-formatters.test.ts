import { describe, it, expect } from 'vitest';
import { formatCellValueForDisplay } from '../cell-formatters.ts';
import type { Config } from '../../../types/config.types.ts';
import { createMockInferredSchema } from '../../../test/factories/data.factory.ts';

const emptyConfig: Config = {};

describe('formatCellValueForDisplay', () => {
  // Text fallback
  it('should return text type for unformatted columns', () => {
    const schema = [createMockInferredSchema({ columnName: 'nom', detectedType: 'text' })];
    const result = formatCellValueForDisplay('Dupont', 'nom', emptyConfig, schema);
    expect(result.type).toBe('text');
    if (result.type === 'text') {
      expect(result.value).toBe('Dupont');
    }
  });

  // Date format via config
  it('should format date column via config', () => {
    const config: Config = {
      columns: {
        formats: {
          date_inscription: { type: 'date', inputFormat: 'YYYY-MM-DD', outputFormat: 'DD/MM/YYYY' },
        },
      },
    };
    const schema = [createMockInferredSchema({ columnName: 'date_inscription', detectedType: 'date' })];
    const result = formatCellValueForDisplay('2024-01-15', 'date_inscription', config, schema);
    expect(result.type).toBe('date');
    if (result.type === 'date') {
      expect(result.value).toBe('15/01/2024');
      expect(result.originalValue).toBe('2024-01-15');
    }
  });

  // Date auto-format (inferred type, no config)
  it('should auto-format inferred date column to DD/MM/YYYY', () => {
    const schema = [createMockInferredSchema({ columnName: 'date_inscription', detectedType: 'date' })];
    const result = formatCellValueForDisplay('2024-01-15', 'date_inscription', emptyConfig, schema);
    expect(result.type).toBe('date');
    if (result.type === 'date') {
      expect(result.value).toBe('15/01/2024');
    }
  });

  // Badge format
  it('should format badge via config', () => {
    const config: Config = {
      columns: {
        formats: {
          statut: {
            type: 'badge',
            map: {
              actif: { color: 'green', variant: 'solid' },
              inactif: { color: 'red', variant: 'outline' },
            },
          },
        },
      },
    };
    const schema = [createMockInferredSchema({ columnName: 'statut', detectedType: 'category' })];
    const result = formatCellValueForDisplay('actif', 'statut', config, schema);
    expect(result.type).toBe('badge');
    if (result.type === 'badge') {
      expect(result.value).toBe('actif');
      expect(result.color).toBe('green');
      expect(result.variant).toBe('solid');
    }
  });

  it('should fallback to text when badge value not in map', () => {
    const config: Config = {
      columns: {
        formats: {
          statut: {
            type: 'badge',
            map: { actif: { color: 'green', variant: 'solid' } },
          },
        },
      },
    };
    const schema = [createMockInferredSchema({ columnName: 'statut', detectedType: 'category' })];
    const result = formatCellValueForDisplay('unknown', 'statut', config, schema);
    expect(result.type).toBe('text');
  });

  // SplitBadges format
  it('should format splitBadges via config', () => {
    const config: Config = {
      columns: {
        formats: {
          tags: { type: 'splitBadges', separator: '|' },
        },
      },
    };
    const schema = [createMockInferredSchema({ columnName: 'tags', detectedType: 'multi' })];
    const result = formatCellValueForDisplay('sport|musique|cinema', 'tags', config, schema);
    expect(result.type).toBe('chips');
    if (result.type === 'chips') {
      expect(result.values).toEqual(['sport', 'musique', 'cinema']);
    }
  });

  // Multi auto-format (inferred type, no config)
  it('should auto-format inferred multi column as chips', () => {
    const schema = [createMockInferredSchema({ columnName: 'tags', detectedType: 'multi', separatorCharacter: '|' })];
    const result = formatCellValueForDisplay('sport|musique', 'tags', emptyConfig, schema);
    expect(result.type).toBe('chips');
    if (result.type === 'chips') {
      expect(result.values).toEqual(['sport', 'musique']);
    }
  });

  // Link format
  it('should format mailto link via config', () => {
    const config: Config = {
      columns: {
        formats: {
          email: { type: 'link', linkType: 'mailto' },
        },
      },
    };
    const schema = [createMockInferredSchema({ columnName: 'email', detectedType: 'text' })];
    const result = formatCellValueForDisplay('jean@test.com', 'email', config, schema);
    expect(result.type).toBe('link');
    if (result.type === 'link') {
      expect(result.href).toBe('mailto:jean@test.com');
      expect(result.linkType).toBe('mailto');
    }
  });

  it('should format tel link via config', () => {
    const config: Config = {
      columns: {
        formats: {
          telephone: { type: 'link', linkType: 'tel' },
        },
      },
    };
    const schema = [createMockInferredSchema({ columnName: 'telephone', detectedType: 'text' })];
    const result = formatCellValueForDisplay('0601020304', 'telephone', config, schema);
    if (result.type === 'link') {
      expect(result.href).toBe('tel:0601020304');
    }
  });

  it('should format url link via config', () => {
    const config: Config = {
      columns: {
        formats: {
          site: { type: 'link', linkType: 'url' },
        },
      },
    };
    const schema = [createMockInferredSchema({ columnName: 'site', detectedType: 'text' })];
    const result = formatCellValueForDisplay('https://example.com', 'site', config, schema);
    if (result.type === 'link') {
      expect(result.href).toBe('https://example.com');
    }
  });

  // Empty value
  it('should return text with empty value for empty string', () => {
    const schema = [createMockInferredSchema({ columnName: 'nom', detectedType: 'text' })];
    const result = formatCellValueForDisplay('', 'nom', emptyConfig, schema);
    expect(result.type).toBe('text');
    if (result.type === 'text') {
      expect(result.value).toBe('');
    }
  });
});
