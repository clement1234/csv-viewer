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

  describe('countByYearFromDate → category filter (year multi-select)', () => {
    it('should create a category filter with isYearFilter for the clicked year', () => {
      const filterState = createEmptyFilterState();
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '2023' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'date_inscription', selectedValues: ['2023'], isYearFilter: true },
      });
    });

    it('should toggle off when clicking the same year', () => {
      const filterState = createEmptyFilterState();
      filterState.categoryFilters = [
        { columnName: 'date_inscription', selectedValues: ['2023'], isYearFilter: true },
      ];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '2023' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'date_inscription', selectedValues: [], isYearFilter: true },
      });
    });

    it('should add new year when clicking a different year (multi-select)', () => {
      const filterState = createEmptyFilterState();
      filterState.categoryFilters = [
        { columnName: 'date_inscription', selectedValues: ['2022'], isYearFilter: true },
      ];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '2023' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'date_inscription', selectedValues: ['2022', '2023'], isYearFilter: true },
      });
    });

    it('should handle invalid date values (with ⚠️ prefix)', () => {
      const filterState = createEmptyFilterState();
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '⚠️ 0' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'date_inscription', selectedValues: ['0'], isYearFilter: true },
      });
    });

    it('should toggle off invalid date when clicking the same value', () => {
      const filterState = createEmptyFilterState();
      filterState.categoryFilters = [
        { columnName: 'date_inscription', selectedValues: ['0'], isYearFilter: true },
      ];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '⚠️ 0' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'date_inscription', selectedValues: [], isYearFilter: true },
      });
    });

    it('should allow mixing valid years and invalid dates', () => {
      const filterState = createEmptyFilterState();
      filterState.categoryFilters = [
        { columnName: 'date_inscription', selectedValues: ['2022', '2023'], isYearFilter: true },
      ];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '⚠️ 0' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'date_inscription', selectedValues: ['2022', '2023', '0'], isYearFilter: true },
      });
    });

    it('should handle empty dates (⚠️ (vide)) by converting to empty string', () => {
      const filterState = createEmptyFilterState();
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '⚠️ (vide)' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'date_inscription', selectedValues: [''], isYearFilter: true },
      });
    });

    it('should toggle off empty dates when clicking twice', () => {
      const filterState = createEmptyFilterState();
      filterState.categoryFilters = [{ columnName: 'date_inscription', selectedValues: [''], isYearFilter: true }];

      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '⚠️ (vide)' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'date_inscription', selectedValues: [], isYearFilter: true },
      });
    });

    it('should remove year from mixed selection', () => {
      const filterState = createEmptyFilterState();
      filterState.categoryFilters = [
        { columnName: 'date_inscription', selectedValues: ['2022', '2023', '0'], isYearFilter: true },
      ];
      const result = buildFilterPayloadFromStatClick(
        { panelType: 'countByYearFromDate', columnName: 'date_inscription', clickedValue: '2023' },
        filterState,
      );
      expect(result).toEqual({
        type: 'category',
        filter: { columnName: 'date_inscription', selectedValues: ['2022', '0'], isYearFilter: true },
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

  it('should return true when year is in category filter', () => {
    const filterState = createEmptyFilterState();
    filterState.categoryFilters = [
      { columnName: 'date', selectedValues: ['2023'], isYearFilter: true },
    ];
    expect(isStatValueActiveInFilters('countByYearFromDate', 'date', '2023', filterState)).toBe(true);
  });

  it('should return false when year is not in category filter', () => {
    const filterState = createEmptyFilterState();
    filterState.categoryFilters = [
      { columnName: 'date', selectedValues: ['2022'], isYearFilter: true },
    ];
    expect(isStatValueActiveInFilters('countByYearFromDate', 'date', '2023', filterState)).toBe(false);
  });

  it('should return true when invalid date (with ⚠️) is in category filter', () => {
    const filterState = createEmptyFilterState();
    filterState.categoryFilters = [
      { columnName: 'date', selectedValues: ['0', '2023'], isYearFilter: true },
    ];
    expect(isStatValueActiveInFilters('countByYearFromDate', 'date', '⚠️ 0', filterState)).toBe(true);
  });

  it('should return false when invalid date is not in category filter', () => {
    const filterState = createEmptyFilterState();
    filterState.categoryFilters = [
      { columnName: 'date', selectedValues: ['2023'], isYearFilter: true },
    ];
    expect(isStatValueActiveInFilters('countByYearFromDate', 'date', '⚠️ 0', filterState)).toBe(false);
  });

  it('should return true when empty date (⚠️ (vide)) is in category filter', () => {
    const filterState = createEmptyFilterState();
    filterState.categoryFilters = [
      { columnName: 'date', selectedValues: ['', '2023'], isYearFilter: true },
    ];
    expect(isStatValueActiveInFilters('countByYearFromDate', 'date', '⚠️ (vide)', filterState)).toBe(true);
  });

  it('should return false when empty date is not in category filter', () => {
    const filterState = createEmptyFilterState();
    filterState.categoryFilters = [
      { columnName: 'date', selectedValues: ['2023'], isYearFilter: true },
    ];
    expect(isStatValueActiveInFilters('countByYearFromDate', 'date', '⚠️ (vide)', filterState)).toBe(false);
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
