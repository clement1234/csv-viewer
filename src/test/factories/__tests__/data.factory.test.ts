import { describe, it, expect } from 'vitest';
import {
  createMockDataRow,
  createMockDataRowArray,
  createMockInferredSchema,
} from '../data.factory.ts';

describe('createMockDataRow', () => {
  it('should return default values when called without overrides', () => {
    const row = createMockDataRow();
    expect(row.nom).toBe('Dupont');
    expect(row.prenom).toBe('Jean');
    expect(row.email).toBe('jean.dupont@example.com');
  });

  it('should override specific fields while keeping defaults', () => {
    const row = createMockDataRow({ nom: 'Martin' });
    expect(row.nom).toBe('Martin');
    expect(row.prenom).toBe('Jean');
    expect(row.email).toBe('jean.dupont@example.com');
  });

  it('should allow adding extra fields via overrides', () => {
    const row = createMockDataRow({ ville: 'Paris' });
    expect(row.ville).toBe('Paris');
    expect(row.nom).toBe('Dupont');
  });
});

describe('createMockDataRowArray', () => {
  it('should create the requested number of rows', () => {
    const rows = createMockDataRowArray(5);
    expect(rows).toHaveLength(5);
  });

  it('should use default generator with index-based nom', () => {
    const rows = createMockDataRowArray(3);
    expect(rows[0].nom).toBe('Nom_0');
    expect(rows[1].nom).toBe('Nom_1');
    expect(rows[2].nom).toBe('Nom_2');
  });

  it('should use custom generator when provided', () => {
    const rows = createMockDataRowArray(2, (index) => ({
      nom: `Custom_${index}`,
      age: String(20 + index),
    }));
    expect(rows[0].nom).toBe('Custom_0');
    expect(rows[0].age).toBe('20');
    expect(rows[1].nom).toBe('Custom_1');
    expect(rows[1].age).toBe('21');
  });

  it('should return an empty array when count is 0', () => {
    const rows = createMockDataRowArray(0);
    expect(rows).toHaveLength(0);
  });
});

describe('createMockInferredSchema', () => {
  it('should return default schema when called without overrides', () => {
    const schema = createMockInferredSchema();
    expect(schema.columnName).toBe('nom');
    expect(schema.detectedType).toBe('text');
    expect(schema.distinctValuesCount).toBe(10);
    expect(schema.emptyValuesRate).toBe(0);
    expect(schema.sampleValues).toEqual(['Dupont', 'Martin', 'Durand']);
  });

  it('should override specific fields while keeping defaults', () => {
    const schema = createMockInferredSchema({
      columnName: 'age',
      detectedType: 'number',
      minValue: 18,
      maxValue: 65,
    });
    expect(schema.columnName).toBe('age');
    expect(schema.detectedType).toBe('number');
    expect(schema.minValue).toBe(18);
    expect(schema.maxValue).toBe(65);
    expect(schema.distinctValuesCount).toBe(10);
  });

  it('should allow creating a multi-type schema with separator', () => {
    const schema = createMockInferredSchema({
      columnName: 'tags',
      detectedType: 'multi',
      separatorCharacter: '|',
    });
    expect(schema.separatorCharacter).toBe('|');
    expect(schema.detectedType).toBe('multi');
  });
});
