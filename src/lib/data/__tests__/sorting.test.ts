import { describe, it, expect } from 'vitest';
import { sortDataRowsByColumn } from '../sorting.ts';
import type { SortState } from '../../../types/ui.types.ts';
import type { DataRow } from '../../../types/core.types.ts';
import { createMockInferredSchema } from '../../../test/factories/data.factory.ts';

function createTestData(): DataRow[] {
  return [
    { nom: 'Dupont', age: '30', date_inscription: '2024-01-15', actif: 'oui' },
    { nom: 'Martin', age: '25', date_inscription: '2024-03-20', actif: 'non' },
    { nom: 'Bernard', age: '40', date_inscription: '2023-06-10', actif: 'oui' },
    { nom: 'Albert', age: '35', date_inscription: '2024-02-28', actif: 'non' },
  ];
}

const textSchema = [createMockInferredSchema({ columnName: 'nom', detectedType: 'text' })];
const numberSchema = [createMockInferredSchema({ columnName: 'age', detectedType: 'number' })];
const dateSchema = [createMockInferredSchema({ columnName: 'date_inscription', detectedType: 'date' })];
const booleanSchema = [createMockInferredSchema({ columnName: 'actif', detectedType: 'boolean' })];

describe('sortDataRowsByColumn', () => {
  it('should return data as-is when columnName is null', () => {
    const data = createTestData();
    const sortState: SortState = { columnName: null, direction: null };
    const result = sortDataRowsByColumn(data, sortState, textSchema);
    expect(result).toEqual(data);
  });

  it('should sort text column ascending', () => {
    const sortState: SortState = { columnName: 'nom', direction: 'asc' };
    const result = sortDataRowsByColumn(createTestData(), sortState, textSchema);
    expect(result[0]['nom']).toBe('Albert');
    expect(result[3]['nom']).toBe('Martin');
  });

  it('should sort text column descending', () => {
    const sortState: SortState = { columnName: 'nom', direction: 'desc' };
    const result = sortDataRowsByColumn(createTestData(), sortState, textSchema);
    expect(result[0]['nom']).toBe('Martin');
    expect(result[3]['nom']).toBe('Albert');
  });

  it('should sort number column ascending', () => {
    const sortState: SortState = { columnName: 'age', direction: 'asc' };
    const result = sortDataRowsByColumn(createTestData(), sortState, numberSchema);
    expect(result[0]['age']).toBe('25');
    expect(result[3]['age']).toBe('40');
  });

  it('should sort number column descending', () => {
    const sortState: SortState = { columnName: 'age', direction: 'desc' };
    const result = sortDataRowsByColumn(createTestData(), sortState, numberSchema);
    expect(result[0]['age']).toBe('40');
    expect(result[3]['age']).toBe('25');
  });

  it('should sort date column ascending', () => {
    const sortState: SortState = { columnName: 'date_inscription', direction: 'asc' };
    const result = sortDataRowsByColumn(createTestData(), sortState, dateSchema);
    expect(result[0]['date_inscription']).toBe('2023-06-10');
    expect(result[3]['date_inscription']).toBe('2024-03-20');
  });

  it('should sort date column descending', () => {
    const sortState: SortState = { columnName: 'date_inscription', direction: 'desc' };
    const result = sortDataRowsByColumn(createTestData(), sortState, dateSchema);
    expect(result[0]['date_inscription']).toBe('2024-03-20');
    expect(result[3]['date_inscription']).toBe('2023-06-10');
  });

  it('should sort boolean column (false < true)', () => {
    const sortState: SortState = { columnName: 'actif', direction: 'asc' };
    const result = sortDataRowsByColumn(createTestData(), sortState, booleanSchema);
    expect(result[0]['actif']).toBe('non');
    expect(result[3]['actif']).toBe('oui');
  });

  it('should not mutate the original array', () => {
    const data = createTestData();
    const original = [...data];
    const sortState: SortState = { columnName: 'nom', direction: 'asc' };
    sortDataRowsByColumn(data, sortState, textSchema);
    expect(data).toEqual(original);
  });

  it('should put non-numeric values at the end when sorting numbers', () => {
    const data: DataRow[] = [
      { age: '30' },
      { age: 'abc' },
      { age: '10' },
    ];
    const sortState: SortState = { columnName: 'age', direction: 'asc' };
    const result = sortDataRowsByColumn(data, sortState, numberSchema);
    expect(result[0]['age']).toBe('10');
    expect(result[1]['age']).toBe('30');
    expect(result[2]['age']).toBe('abc');
  });

  it('should put invalid dates at the end when sorting dates', () => {
    const data: DataRow[] = [
      { date_inscription: '2024-03-20' },
      { date_inscription: 'not-a-date' },
      { date_inscription: '2024-01-15' },
    ];
    const sortState: SortState = { columnName: 'date_inscription', direction: 'asc' };
    const result = sortDataRowsByColumn(data, sortState, dateSchema);
    expect(result[0]['date_inscription']).toBe('2024-01-15');
    expect(result[1]['date_inscription']).toBe('2024-03-20');
    expect(result[2]['date_inscription']).toBe('not-a-date');
  });

  it('should handle empty data', () => {
    const sortState: SortState = { columnName: 'nom', direction: 'asc' };
    const result = sortDataRowsByColumn([], sortState, textSchema);
    expect(result).toEqual([]);
  });
});
