import { describe, it, expect } from 'vitest';
import type {
  DataRow,
  RawDataRow,
  ColumnDataType,
  InferredColumnSchema,
  ColumnTypeDetectionResult,
} from '../core.types.ts';

describe('core.types', () => {
  it('should allow creating a DataRow with string values', () => {
    const row: DataRow = { nom: 'Dupont', prenom: 'Jean' };
    expect(row.nom).toBe('Dupont');
    expect(row.prenom).toBe('Jean');
  });

  it('should allow creating a RawDataRow with unknown values', () => {
    const row: RawDataRow = { nom: 'Dupont', age: 30, active: true };
    expect(row.nom).toBe('Dupont');
    expect(row.age).toBe(30);
    expect(row.active).toBe(true);
  });

  it('should support all ColumnDataType values', () => {
    const types: ColumnDataType[] = ['date', 'number', 'boolean', 'category', 'multi', 'text'];
    expect(types).toHaveLength(6);
  });

  it('should allow creating a complete InferredColumnSchema', () => {
    const schema: InferredColumnSchema = {
      columnName: 'date_inscription',
      detectedType: 'date',
      distinctValuesCount: 50,
      emptyValuesRate: 0.1,
      sampleValues: ['2024-01-15', '2024-02-20'],
      separatorCharacter: undefined,
      possibleOptions: undefined,
      minValue: undefined,
      maxValue: undefined,
    };
    expect(schema.columnName).toBe('date_inscription');
    expect(schema.detectedType).toBe('date');
    expect(schema.emptyValuesRate).toBe(0.1);
  });

  it('should allow InferredColumnSchema with optional fields for number type', () => {
    const schema: InferredColumnSchema = {
      columnName: 'montant',
      detectedType: 'number',
      distinctValuesCount: 100,
      emptyValuesRate: 0,
      sampleValues: ['100', '200.50', '1500'],
      minValue: 100,
      maxValue: 1500,
    };
    expect(schema.minValue).toBe(100);
    expect(schema.maxValue).toBe(1500);
  });

  it('should allow InferredColumnSchema with separator for multi type', () => {
    const schema: InferredColumnSchema = {
      columnName: 'tags',
      detectedType: 'multi',
      distinctValuesCount: 15,
      emptyValuesRate: 0.05,
      sampleValues: ['sport|musique', 'cinema|art'],
      separatorCharacter: '|',
    };
    expect(schema.separatorCharacter).toBe('|');
  });

  it('should allow creating a ColumnTypeDetectionResult', () => {
    const result: ColumnTypeDetectionResult = {
      type: 'category',
      possibleOptions: ['actif', 'inactif', 'suspendu'],
    };
    expect(result.type).toBe('category');
    expect(result.possibleOptions).toHaveLength(3);
  });
});
