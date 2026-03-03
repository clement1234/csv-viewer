import { describe, it, expect } from 'vitest';
import {
  inferSchemaFromDataRows,
  detectColumnTypeFromValues,
  calculateEmptyValuesRate,
  extractDistinctNonEmptyValues,
  selectDefaultVisibleColumns,
  generateDefaultConfigFromSchema,
} from '../schema-inference.ts';
import { createMockDataRowArray } from '../../../test/factories/data.factory.ts';
import type { DataRow } from '../../../types/core.types.ts';

describe('calculateEmptyValuesRate', () => {
  it('should return 0 for all non-empty values', () => {
    expect(calculateEmptyValuesRate(['a', 'b', 'c'])).toBe(0);
  });

  it('should return 1 for all empty values', () => {
    expect(calculateEmptyValuesRate(['', '', ''])).toBe(1);
  });

  it('should return correct rate for mixed values', () => {
    expect(calculateEmptyValuesRate(['a', '', 'c', ''])).toBe(0.5);
  });

  it('should return 0 for empty array', () => {
    expect(calculateEmptyValuesRate([])).toBe(0);
  });
});

describe('extractDistinctNonEmptyValues', () => {
  it('should return unique non-empty values', () => {
    const result = extractDistinctNonEmptyValues(['a', 'b', 'a', '', 'c']);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should return empty array for all empty values', () => {
    expect(extractDistinctNonEmptyValues(['', '', ''])).toEqual([]);
  });
});

describe('detectColumnTypeFromValues', () => {
  it('should detect date column', () => {
    const values = ['2024-01-15', '2024-02-20', '2024-03-10', '2024-04-05', '2024-05-12'];
    expect(detectColumnTypeFromValues(values).type).toBe('date');
  });

  it('should detect number column', () => {
    const values = ['100', '200', '300.5', '42', '99'];
    expect(detectColumnTypeFromValues(values).type).toBe('number');
  });

  it('should compute min and max for number columns', () => {
    const values = ['10', '200', '50'];
    const result = detectColumnTypeFromValues(values);
    expect(result.type).toBe('number');
    expect(result.minValue).toBe(10);
    expect(result.maxValue).toBe(200);
  });

  it('should detect boolean column', () => {
    const values = ['oui', 'non', 'oui', 'non', 'oui'];
    expect(detectColumnTypeFromValues(values).type).toBe('boolean');
  });

  it('should detect multi column with pipe separator', () => {
    const values = ['sport|musique', 'cinema|art', 'sport|art', 'musique|cinema'];
    const result = detectColumnTypeFromValues(values);
    expect(result.type).toBe('multi');
    expect(result.separatorCharacter).toBe('|');
  });

  it('should detect category column with low cardinality', () => {
    const values = Array(100).fill(null).map((_, i) => ['actif', 'inactif', 'suspendu'][i % 3]);
    expect(detectColumnTypeFromValues(values).type).toBe('category');
  });

  it('should detect text column as fallback', () => {
    const values = Array(100).fill(null).map((_, i) => `unique_value_${i}`);
    expect(detectColumnTypeFromValues(values).type).toBe('text');
  });

  it('should handle all empty values as text', () => {
    expect(detectColumnTypeFromValues([]).type).toBe('text');
  });
});

describe('inferSchemaFromDataRows', () => {
  it('should infer schema for each column', () => {
    const data: DataRow[] = [
      { nom: 'Dupont', age: '30', actif: 'oui' },
      { nom: 'Martin', age: '25', actif: 'non' },
      { nom: 'Durand', age: '40', actif: 'oui' },
    ];
    const schema = inferSchemaFromDataRows(data);
    expect(schema).toHaveLength(3);
    expect(schema.find((s) => s.columnName === 'nom')).toBeDefined();
    expect(schema.find((s) => s.columnName === 'age')).toBeDefined();
  });

  it('should respect sampleSize parameter', () => {
    const data = createMockDataRowArray(500);
    const schema = inferSchemaFromDataRows(data, 50);
    expect(schema.length).toBeGreaterThan(0);
  });

  it('should calculate correct emptyValuesRate', () => {
    const data: DataRow[] = [
      { nom: 'A', ville: '' },
      { nom: 'B', ville: 'Paris' },
      { nom: 'C', ville: '' },
      { nom: 'D', ville: '' },
    ];
    const schema = inferSchemaFromDataRows(data);
    const villeSchema = schema.find((s) => s.columnName === 'ville');
    expect(villeSchema?.emptyValuesRate).toBe(0.75);
  });

  it('should calculate correct distinctValuesCount', () => {
    const data: DataRow[] = [
      { statut: 'actif' },
      { statut: 'inactif' },
      { statut: 'actif' },
      { statut: 'suspendu' },
    ];
    const schema = inferSchemaFromDataRows(data);
    expect(schema[0].distinctValuesCount).toBe(3);
  });

  it('should provide sample values', () => {
    const data: DataRow[] = [
      { nom: 'Dupont' },
      { nom: 'Martin' },
      { nom: 'Durand' },
    ];
    const schema = inferSchemaFromDataRows(data);
    expect(schema[0].sampleValues.length).toBeGreaterThan(0);
    expect(schema[0].sampleValues.length).toBeLessThanOrEqual(5);
  });

  it('should handle empty dataset', () => {
    const schema = inferSchemaFromDataRows([]);
    expect(schema).toEqual([]);
  });
});

describe('selectDefaultVisibleColumns', () => {
  it('should exclude columns with high empty rate', () => {
    const schema = [
      { columnName: 'nom', detectedType: 'text' as const, distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'notes', detectedType: 'text' as const, distinctValuesCount: 5, emptyValuesRate: 0.8, sampleValues: [] },
    ];
    const result = selectDefaultVisibleColumns(schema);
    expect(result).toContain('nom');
    expect(result).not.toContain('notes');
  });

  it('should limit to max columns', () => {
    const schema = Array.from({ length: 20 }, (_, i) => ({
      columnName: `col_${i}`,
      detectedType: 'text' as const,
      distinctValuesCount: 10,
      emptyValuesRate: 0,
      sampleValues: [],
    }));
    const result = selectDefaultVisibleColumns(schema, 5);
    expect(result).toHaveLength(5);
  });
});

describe('generateDefaultConfigFromSchema', () => {
  it('should generate filters based on detected types', () => {
    const schema = [
      { columnName: 'nom', detectedType: 'text' as const, distinctValuesCount: 50, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'statut', detectedType: 'category' as const, distinctValuesCount: 3, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'date_inscription', detectedType: 'date' as const, distinctValuesCount: 100, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'age', detectedType: 'number' as const, distinctValuesCount: 50, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'actif', detectedType: 'boolean' as const, distinctValuesCount: 2, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'tags', detectedType: 'multi' as const, distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
    ];
    const config = generateDefaultConfigFromSchema(schema);
    expect(config.filters?.text).toContain('nom');
    expect(config.filters?.dropdown).toContain('statut');
    expect(config.filters?.dateRange).toContain('date_inscription');
    expect(config.filters?.numberRange).toContain('age');
    expect(config.filters?.boolean).toContain('actif');
    expect(config.filters?.multiSelect).toContain('tags');
  });

  it('should set defaultVisible columns', () => {
    const schema = [
      { columnName: 'nom', detectedType: 'text' as const, distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'prenom', detectedType: 'text' as const, distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
    ];
    const config = generateDefaultConfigFromSchema(schema);
    expect(config.columns?.defaultVisible).toContain('nom');
    expect(config.columns?.defaultVisible).toContain('prenom');
  });

  it('should set globalSearchColumns for text columns with low empty rate', () => {
    const schema = [
      { columnName: 'nom', detectedType: 'text' as const, distinctValuesCount: 50, emptyValuesRate: 0.1, sampleValues: [] },
      { columnName: 'notes', detectedType: 'text' as const, distinctValuesCount: 5, emptyValuesRate: 0.5, sampleValues: [] },
    ];
    const config = generateDefaultConfigFromSchema(schema);
    expect(config.filters?.globalSearchColumns).toContain('nom');
    expect(config.filters?.globalSearchColumns).not.toContain('notes');
  });
});
