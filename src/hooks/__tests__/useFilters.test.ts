import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../useFilters.ts';

describe('useFilters', () => {
  it('should start with empty filter state', () => {
    const { result } = renderHook(() => useFilters());
    expect(result.current.filterState.textFilters).toHaveLength(0);
    expect(result.current.activeFiltersCount).toBe(0);
  });

  it('should update a text filter', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter({
        type: 'text',
        filter: { columnName: 'nom', searchTerm: 'Dupont' },
      });
    });
    expect(result.current.filterState.textFilters).toHaveLength(1);
    expect(result.current.activeFiltersCount).toBe(1);
  });

  it('should update existing filter for same column', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter({
        type: 'text',
        filter: { columnName: 'nom', searchTerm: 'Dupont' },
      });
    });
    act(() => {
      result.current.updateFilter({
        type: 'text',
        filter: { columnName: 'nom', searchTerm: 'Martin' },
      });
    });
    expect(result.current.filterState.textFilters).toHaveLength(1);
    expect(result.current.filterState.textFilters[0].searchTerm).toBe('Martin');
  });

  it('should update global search filter', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter({
        type: 'globalSearch',
        filter: { searchTerm: 'test', targetColumns: ['nom'] },
      });
    });
    expect(result.current.filterState.globalSearch?.searchTerm).toBe('test');
    expect(result.current.activeFiltersCount).toBe(1);
  });

  it('should reset all filters', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter({
        type: 'text',
        filter: { columnName: 'nom', searchTerm: 'Dupont' },
      });
      result.current.updateFilter({
        type: 'category',
        filter: { columnName: 'ville', selectedValues: ['Paris'] },
      });
    });
    expect(result.current.activeFiltersCount).toBe(2);
    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.activeFiltersCount).toBe(0);
    expect(result.current.filterState.textFilters).toHaveLength(0);
  });

  it('should count only active filters (non-empty)', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter({
        type: 'text',
        filter: { columnName: 'nom', searchTerm: '' },
      });
      result.current.updateFilter({
        type: 'boolean',
        filter: { columnName: 'actif', selectedValue: 'all' },
      });
    });
    expect(result.current.activeFiltersCount).toBe(0);
  });

  it('should remove text filter when searchTerm is empty', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter({
        type: 'text',
        filter: { columnName: 'nom', searchTerm: 'Dupont' },
      });
    });
    expect(result.current.filterState.textFilters).toHaveLength(1);
    act(() => {
      result.current.updateFilter({
        type: 'text',
        filter: { columnName: 'nom', searchTerm: '' },
      });
    });
    expect(result.current.filterState.textFilters).toHaveLength(0);
  });

  it('should remove dateRange filter when both dates are null', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter({
        type: 'dateRange',
        filter: { columnName: 'date', startDate: '2024-01-01', endDate: '2024-12-31' },
      });
    });
    expect(result.current.filterState.dateRangeFilters).toHaveLength(1);
    act(() => {
      result.current.updateFilter({
        type: 'dateRange',
        filter: { columnName: 'date', startDate: null, endDate: null },
      });
    });
    expect(result.current.filterState.dateRangeFilters).toHaveLength(0);
  });

  it('should allow year category filter and regular category filter on same column', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter({
        type: 'category',
        filter: { columnName: 'ville', selectedValues: ['Paris'] },
      });
      result.current.updateFilter({
        type: 'category',
        filter: { columnName: 'ville', selectedValues: ['2024'], isYearFilter: true },
      });
    });
    expect(result.current.filterState.categoryFilters).toHaveLength(2);
    expect(result.current.filterState.categoryFilters[0].isYearFilter).toBeUndefined();
    expect(result.current.filterState.categoryFilters[1].isYearFilter).toBe(true);
  });

  it('should update year filter independently from regular category filter', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.updateFilter({
        type: 'category',
        filter: { columnName: 'date', selectedValues: ['Paris'], isYearFilter: undefined },
      });
      result.current.updateFilter({
        type: 'category',
        filter: { columnName: 'date', selectedValues: ['2024'], isYearFilter: true },
      });
    });
    expect(result.current.filterState.categoryFilters).toHaveLength(2);
    act(() => {
      result.current.updateFilter({
        type: 'category',
        filter: { columnName: 'date', selectedValues: ['2024', '2023'], isYearFilter: true },
      });
    });
    expect(result.current.filterState.categoryFilters).toHaveLength(2);
    const yearFilter = result.current.filterState.categoryFilters.find((f) => f.isYearFilter);
    expect(yearFilter?.selectedValues).toEqual(['2024', '2023']);
  });
});
