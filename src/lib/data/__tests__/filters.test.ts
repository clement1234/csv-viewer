import { describe, it, expect } from 'vitest';
import { applyAllFiltersToDataRows } from '../filters.ts';
import type { FilterState } from '../../../types/ui.types.ts';
import type { DataRow, InferredColumnSchema } from '../../../types/core.types.ts';
import { createMockInferredSchema } from '../../../test/factories/data.factory.ts';

function createTestData(): DataRow[] {
  return [
    { nom: 'Dupont', prenom: 'Jean', age: '30', ville: 'Paris', date_inscription: '2024-01-15', actif: 'oui', tags: 'sport|musique' },
    { nom: 'Martin', prenom: 'Paul', age: '25', ville: 'Lyon', date_inscription: '2024-03-20', actif: 'non', tags: 'cinema|art' },
    { nom: 'Durand', prenom: 'Marie', age: '40', ville: 'Paris', date_inscription: '2023-06-10', actif: 'oui', tags: 'sport|art' },
    { nom: 'Bernard', prenom: 'Luc', age: '35', ville: 'Marseille', date_inscription: '2024-02-28', actif: 'oui', tags: 'musique' },
    { nom: 'Petit', prenom: 'Claire', age: '28', ville: 'Lyon', date_inscription: '2023-12-01', actif: 'non', tags: 'sport|cinema' },
  ];
}

function createTestSchema(): InferredColumnSchema[] {
  return [
    createMockInferredSchema({ columnName: 'nom', detectedType: 'text' }),
    createMockInferredSchema({ columnName: 'prenom', detectedType: 'text' }),
    createMockInferredSchema({ columnName: 'age', detectedType: 'number' }),
    createMockInferredSchema({ columnName: 'ville', detectedType: 'category' }),
    createMockInferredSchema({ columnName: 'date_inscription', detectedType: 'date' }),
    createMockInferredSchema({ columnName: 'actif', detectedType: 'boolean' }),
    createMockInferredSchema({ columnName: 'tags', detectedType: 'multi', separatorCharacter: '|' }),
  ];
}

function emptyFilterState(): FilterState {
  return {
    textFilters: [],
    categoryFilters: [],
    dateRangeFilters: [],
    numberRangeFilters: [],
    booleanFilters: [],
    multiSelectFilters: [],
  };
}

describe('applyAllFiltersToDataRows', () => {
  it('should return all rows when no filters are active', () => {
    const result = applyAllFiltersToDataRows(createTestData(), emptyFilterState(), createTestSchema());
    expect(result).toHaveLength(5);
  });

  // Global search
  it('should filter by global search term', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      globalSearch: { searchTerm: 'dupont', targetColumns: ['nom', 'prenom'] },
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(1);
    expect(result[0]['nom']).toBe('Dupont');
  });

  it('should be case-insensitive for global search', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      globalSearch: { searchTerm: 'JEAN', targetColumns: ['nom', 'prenom'] },
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(1);
  });

  // Text filter
  it('should filter by text column value', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      textFilters: [{ columnName: 'nom', searchTerm: 'mar' }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(1);
    expect(result[0]['nom']).toBe('Martin');
  });

  // Category filter
  it('should filter by category (OR between selected values)', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      categoryFilters: [{ columnName: 'ville', selectedValues: ['Paris', 'Lyon'] }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(4);
  });

  it('should not filter when category selectedValues is empty', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      categoryFilters: [{ columnName: 'ville', selectedValues: [] }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(5);
  });

  // Date range filter
  it('should filter by date range (inclusive)', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      dateRangeFilters: [{ columnName: 'date_inscription', startDate: '2024-01-01', endDate: '2024-02-28' }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(2);
  });

  it('should include rows matching exact start/end dates', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      dateRangeFilters: [{ columnName: 'date_inscription', startDate: '2024-01-15', endDate: '2024-01-15' }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(1);
  });

  it('should handle date range with only startDate', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      dateRangeFilters: [{ columnName: 'date_inscription', startDate: '2024-03-01', endDate: null }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(1);
  });

  it('should handle date range with only endDate', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      dateRangeFilters: [{ columnName: 'date_inscription', startDate: null, endDate: '2023-12-31' }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(2);
  });

  it('should exclude empty/invalid dates by default', () => {
    const dataWithEmptyDates: DataRow[] = [
      { date_inscription: '2024-01-15' },
      { date_inscription: '' },
      { date_inscription: 'invalid' },
      { date_inscription: '2024-03-20' },
    ];
    const schema = [createMockInferredSchema({ columnName: 'date_inscription', detectedType: 'date' })];
    const filters: FilterState = {
      ...emptyFilterState(),
      dateRangeFilters: [{ columnName: 'date_inscription', startDate: '2024-01-01', endDate: '2024-12-31' }],
    };
    const result = applyAllFiltersToDataRows(dataWithEmptyDates, filters, schema);
    expect(result).toHaveLength(2);
  });

  it('should include empty/invalid dates when includeEmpty is true', () => {
    const dataWithEmptyDates: DataRow[] = [
      { date_inscription: '2024-01-15' },
      { date_inscription: '' },
      { date_inscription: 'invalid' },
      { date_inscription: '2024-03-20' },
    ];
    const schema = [createMockInferredSchema({ columnName: 'date_inscription', detectedType: 'date' })];
    const filters: FilterState = {
      ...emptyFilterState(),
      dateRangeFilters: [{ columnName: 'date_inscription', startDate: '2024-01-01', endDate: '2024-12-31', includeEmpty: true }],
    };
    const result = applyAllFiltersToDataRows(dataWithEmptyDates, filters, schema);
    expect(result).toHaveLength(4);
  });

  it('should show only empty/invalid dates when includeEmpty is true with no date range', () => {
    const dataWithEmptyDates: DataRow[] = [
      { date_inscription: '2024-01-15' },
      { date_inscription: '' },
      { date_inscription: 'invalid' },
      { date_inscription: '2024-03-20' },
    ];
    const schema = [createMockInferredSchema({ columnName: 'date_inscription', detectedType: 'date' })];
    const filters: FilterState = {
      ...emptyFilterState(),
      dateRangeFilters: [{ columnName: 'date_inscription', startDate: null, endDate: null, includeEmpty: true }],
    };
    const result = applyAllFiltersToDataRows(dataWithEmptyDates, filters, schema);
    expect(result).toHaveLength(2);
    expect(result.every((row) => !row.date_inscription || row.date_inscription === 'invalid')).toBe(true);
  });

  // Number range filter
  it('should filter by number range (inclusive)', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      numberRangeFilters: [{ columnName: 'age', minValue: 28, maxValue: 35 }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(3);
  });

  it('should handle number range with only minValue', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      numberRangeFilters: [{ columnName: 'age', minValue: 35, maxValue: null }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(2);
  });

  it('should exclude non-numeric values from number filter', () => {
    const data = [
      { age: '30' },
      { age: 'abc' },
      { age: '25' },
    ];
    const schema = [createMockInferredSchema({ columnName: 'age', detectedType: 'number' })];
    const filters: FilterState = {
      ...emptyFilterState(),
      numberRangeFilters: [{ columnName: 'age', minValue: 20, maxValue: 40 }],
    };
    const result = applyAllFiltersToDataRows(data, filters, schema);
    expect(result).toHaveLength(2);
  });

  // Boolean filter
  it('should filter by boolean true', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      booleanFilters: [{ columnName: 'actif', selectedValue: 'true' }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(3);
  });

  it('should filter by boolean false', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      booleanFilters: [{ columnName: 'actif', selectedValue: 'false' }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(2);
  });

  it('should not filter when boolean is "all"', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      booleanFilters: [{ columnName: 'actif', selectedValue: 'all' }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(5);
  });

  // Multi-select filter
  it('should filter by multi-select values (intersection)', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      multiSelectFilters: [{ columnName: 'tags', selectedValues: ['sport'] }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(3);
  });

  it('should not filter when multi-select selectedValues is empty', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      multiSelectFilters: [{ columnName: 'tags', selectedValues: [] }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(5);
  });

  // Combination (AND)
  it('should combine multiple filters with AND logic', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      categoryFilters: [{ columnName: 'ville', selectedValues: ['Paris'] }],
      booleanFilters: [{ columnName: 'actif', selectedValue: 'true' }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(2);
  });

  // Year filters (category filter with isYearFilter flag)
  it('should filter by year when isYearFilter is true', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      categoryFilters: [{ columnName: 'date_inscription', selectedValues: ['2024'], isYearFilter: true }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(3); // 3 rows from 2024
    expect(result.every((row) => row.date_inscription.startsWith('2024'))).toBe(true);
  });

  it('should filter by multiple years when isYearFilter is true', () => {
    const filters: FilterState = {
      ...emptyFilterState(),
      categoryFilters: [{ columnName: 'date_inscription', selectedValues: ['2023', '2024'], isYearFilter: true }],
    };
    const result = applyAllFiltersToDataRows(createTestData(), filters, createTestSchema());
    expect(result).toHaveLength(5); // All rows are from 2023 or 2024
  });

  it('should filter by invalid date values when isYearFilter is true', () => {
    const dataWithInvalidDates: DataRow[] = [
      { nom: 'Dupont', date_inscription: '2024-01-15' },
      { nom: 'Martin', date_inscription: '0' },
      { nom: 'Durand', date_inscription: 'invalid' },
      { nom: 'Bernard', date_inscription: '2023-06-10' },
    ];
    const filters: FilterState = {
      ...emptyFilterState(),
      categoryFilters: [{ columnName: 'date_inscription', selectedValues: ['0', 'invalid'], isYearFilter: true }],
    };
    const result = applyAllFiltersToDataRows(dataWithInvalidDates, filters, createTestSchema());
    expect(result).toHaveLength(2);
    expect(result[0].nom).toBe('Martin');
    expect(result[1].nom).toBe('Durand');
  });

  it('should filter by mix of valid years and invalid dates when isYearFilter is true', () => {
    const dataWithInvalidDates: DataRow[] = [
      { nom: 'Dupont', date_inscription: '2024-01-15' },
      { nom: 'Martin', date_inscription: '0' },
      { nom: 'Durand', date_inscription: '2023-06-10' },
      { nom: 'Bernard', date_inscription: 'invalid' },
      { nom: 'Petit', date_inscription: '2022-01-01' },
    ];
    const filters: FilterState = {
      ...emptyFilterState(),
      categoryFilters: [{ columnName: 'date_inscription', selectedValues: ['2024', '0'], isYearFilter: true }],
    };
    const result = applyAllFiltersToDataRows(dataWithInvalidDates, filters, createTestSchema());
    expect(result).toHaveLength(2); // Dupont (2024) and Martin (0)
    expect(result.map((r) => r.nom)).toEqual(['Dupont', 'Martin']);
  });

  it('should exclude empty date values when selecting only years', () => {
    const dataWithEmptyDates: DataRow[] = [
      { nom: 'Dupont', date_inscription: '2024-01-15' },
      { nom: 'Martin', date_inscription: '' },
      { nom: 'Durand', date_inscription: '2024-06-10' },
    ];
    const filters: FilterState = {
      ...emptyFilterState(),
      categoryFilters: [{ columnName: 'date_inscription', selectedValues: ['2024'], isYearFilter: true }],
    };
    const result = applyAllFiltersToDataRows(dataWithEmptyDates, filters, createTestSchema());
    expect(result).toHaveLength(2);
    expect(result.every((row) => row.nom !== 'Martin')).toBe(true);
  });

  it('should filter empty date values when explicitly selected with year filter', () => {
    const dataWithEmptyDates: DataRow[] = [
      { nom: 'Dupont', date_inscription: '2024-01-15' },
      { nom: 'Martin', date_inscription: '' },
      { nom: 'Durand', date_inscription: '2024-06-10' },
      { nom: 'Bernard', date_inscription: '' },
    ];
    const filters: FilterState = {
      ...emptyFilterState(),
      categoryFilters: [{ columnName: 'date_inscription', selectedValues: [''], isYearFilter: true }],
    };
    const result = applyAllFiltersToDataRows(dataWithEmptyDates, filters, createTestSchema());
    expect(result).toHaveLength(2);
    expect(result.every((row) => row.date_inscription === '')).toBe(true);
  });

  it('should allow mixing years and empty dates in year filter', () => {
    const dataWithEmptyDates: DataRow[] = [
      { nom: 'Dupont', date_inscription: '2024-01-15' },
      { nom: 'Martin', date_inscription: '' },
      { nom: 'Durand', date_inscription: '2023-06-10' },
      { nom: 'Bernard', date_inscription: '' },
      { nom: 'Petit', date_inscription: '2022-01-01' },
    ];
    const filters: FilterState = {
      ...emptyFilterState(),
      categoryFilters: [{ columnName: 'date_inscription', selectedValues: ['2024', ''], isYearFilter: true }],
    };
    const result = applyAllFiltersToDataRows(dataWithEmptyDates, filters, createTestSchema());
    expect(result).toHaveLength(3); // Dupont (2024), Martin (empty), Bernard (empty)
    expect(result.map((r) => r.nom).sort()).toEqual(['Bernard', 'Dupont', 'Martin']);
  });
});
