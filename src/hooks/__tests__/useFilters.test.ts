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
});
