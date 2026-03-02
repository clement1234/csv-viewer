import { describe, it, expect } from 'vitest';
import {
  buildFilterPayloadFromStatClick,
  isStatValueActiveInFilters,
} from '../stats-filter-mapping.ts';
import type { FilterState } from '../../../types/ui.types.ts';

function createEmptyFilterState(): FilterState {
  return {
    textFilters: [],
    categoryFilters: [],
    dateRangeFilters: [],
    numberRangeFilters: [],
    booleanFilters: [],
    multiSelectFilters: [],
  };
}

describe('buildFilterPayloadFromStatClick', () => {
  describe('countByColumn → category filter', () => {
    it('should create a category filter with the clicked value when no filter exists', () => {
      const filterState = createEmptyFilterState();
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByColumn', columnName: 'statut', clickedValue: 'actif' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'statut', selectedValues: ['actif'] },
      });
    });

    it('should add a second value to existing category filter (cumulative OR)', () => {
      const filterState = createEmptyFilterState();
      filterState.categoryFilters = [{ columnName: 'statut', selectedValues: ['actif'] }];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByColumn', columnName: 'statut', clickedValue: 'inactif' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'statut', selectedValues: ['actif', 'inactif'] },
      });
    });

    it('should remove the value when clicking an already active value (toggle off)', () => {
      const filterState = createEmptyFilterState();
      filterState.categoryFilters = [{ columnName: 'statut', selectedValues: ['actif', 'inactif'] }];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByColumn', columnName: 'statut', clickedValue: 'actif' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'statut', selectedValues: ['inactif'] },
      });
    });

    it('should return empty selectedValues when toggling off the last value', () => {
      const filterState = createEmptyFilterState();
      filterState.categoryFilters = [{ columnName: 'statut', selectedValues: ['actif'] }];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByColumn', columnName: 'statut', clickedValue: 'actif' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'statut', selectedValues: [] },
      });
    });
  });

  describe('countByYearFromDate → dateRange filter', () => {
    it('should create a date range filter for the clicked year', () => {
      const filterState = createEmptyFilterState();
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '2023' },
        filterState,
      );
      expect(result).toEqual({
        type: 'dateRange',
        filter: { columnName: 'date_inscription', startDate: '2023-01-01', endDate: '2023-12-31' },
      });
    });

    it('should toggle off date range when clicking the same year', () => {
      const filterState = createEmptyFilterState();
      filterState.dateRangeFilters = [
        { columnName: 'date_inscription', startDate: '2023-01-01', endDate: '2023-12-31' },
      ];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '2023' },
        filterState,
      );
      expect(result).toEqual({
        type: 'dateRange',
        filter: { columnName: 'date_inscription', startDate: null, endDate: null },
      });
    });

    it('should replace with new year when clicking a different year', () => {
      const filterState = createEmptyFilterState();
      filterState.dateRangeFilters = [
        { columnName: 'date_inscription', startDate: '2022-01-01', endDate: '2022-12-31' },
      ];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '2023' },
        filterState,
      );
      expect(result).toEqual({
        type: 'dateRange',
        filter: { columnName: 'date_inscription', startDate: '2023-01-01', endDate: '2023-12-31' },
      });
    });
  });

  describe('countBySplitValues → multiSelect filter', () => {
    it('should create a multiSelect filter with the clicked value', () => {
      const filterState = createEmptyFilterState();
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countBySplitValues', columnName: 'tags', clickedValue: 'react' },
        filterState,
      );
      expect(result).toEqual({
        type: 'multiSelect',
        filter: { columnName: 'tags', selectedValues: ['react'] },
      });
    });

    it('should add a value to existing multiSelect filter', () => {
      const filterState = createEmptyFilterState();
      filterState.multiSelectFilters = [{ columnName: 'tags', selectedValues: ['react'] }];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countBySplitValues', columnName: 'tags', clickedValue: 'node' },
        filterState,
      );
      expect(result).toEqual({
        type: 'multiSelect',
        filter: { columnName: 'tags', selectedValues: ['react', 'node'] },
      });
    });

    it('should toggle off a value from multiSelect filter', () => {
      const filterState = createEmptyFilterState();
      filterState.multiSelectFilters = [{ columnName: 'tags', selectedValues: ['react', 'node'] }];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countBySplitValues', columnName: 'tags', clickedValue: 'react' },
        filterState,
      );
      expect(result).toEqual({
        type: 'multiSelect',
        filter: { columnName: 'tags', selectedValues: ['node'] },
      });
    });
  });
});

describe('isStatValueActiveInFilters', () => {
  it('should return false when no filters exist', () => {
    const filterState = createEmptyFilterState();
    expect(isStatValueActiveInFilters('countByColumn', 'statut', 'actif', filterState)).toBe(false);
  });

  it('should return true when category value is in selectedValues', () => {
    const filterState = createEmptyFilterState();
    filterState.categoryFilters = [{ columnName: 'statut', selectedValues: ['actif'] }];
    expect(isStatValueActiveInFilters('countByColumn', 'statut', 'actif', filterState)).toBe(true);
  });

  it('should return false when category value is not in selectedValues', () => {
    const filterState = createEmptyFilterState();
    filterState.categoryFilters = [{ columnName: 'statut', selectedValues: ['actif'] }];
    expect(isStatValueActiveInFilters('countByColumn', 'statut', 'inactif', filterState)).toBe(false);
  });

  it('should return true when date range matches the year', () => {
    const filterState = createEmptyFilterState();
    filterState.dateRangeFilters = [
      { columnName: 'date', startDate: '2023-01-01', endDate: '2023-12-31' },
    ];
    expect(isStatValueActiveInFilters('countByYearFromDate', 'date', '2023', filterState)).toBe(true);
  });

  it('should return false when date range does not match the year', () => {
    const filterState = createEmptyFilterState();
    filterState.dateRangeFilters = [
      { columnName: 'date', startDate: '2022-01-01', endDate: '2022-12-31' },
    ];
    expect(isStatValueActiveInFilters('countByYearFromDate', 'date', '2023', filterState)).toBe(false);
  });

  it('should return true when multiSelect value is in selectedValues', () => {
    const filterState = createEmptyFilterState();
    filterState.multiSelectFilters = [{ columnName: 'tags', selectedValues: ['react', 'node'] }];
    expect(isStatValueActiveInFilters('countBySplitValues', 'tags', 'react', filterState)).toBe(true);
  });

  it('should return false when multiSelect value is not in selectedValues', () => {
    const filterState = createEmptyFilterState();
    filterState.multiSelectFilters = [{ columnName: 'tags', selectedValues: ['react'] }];
    expect(isStatValueActiveInFilters('countBySplitValues', 'tags', 'node', filterState)).toBe(false);
  });
});
