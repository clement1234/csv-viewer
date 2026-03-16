import { useState, useCallback, useMemo } from 'react';
import type {
  FilterState,
  TextFilter,
  CategoryFilter,
  DateRangeFilter,
  NumberRangeFilter,
  BooleanFilter,
  MultiSelectFilter,
  GlobalSearchFilter,
} from '../types/ui.types.ts';

export type FilterUpdatePayload =
  | { type: 'globalSearch'; filter: GlobalSearchFilter }
  | { type: 'text'; filter: TextFilter }
  | { type: 'category'; filter: CategoryFilter }
  | { type: 'dateRange'; filter: DateRangeFilter }
  | { type: 'numberRange'; filter: NumberRangeFilter }
  | { type: 'boolean'; filter: BooleanFilter }
  | { type: 'multiSelect'; filter: MultiSelectFilter };

interface UseFiltersReturn {
  filterState: FilterState;
  updateFilter: (payload: FilterUpdatePayload) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
}

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

export function useFilters(initialState?: Partial<FilterState>): UseFiltersReturn {
  const [filterState, setFilterState] = useState<FilterState>({
    ...createEmptyFilterState(),
    ...initialState,
  });

  const updateFilter = useCallback((payload: FilterUpdatePayload): void => {
    setFilterState((previous) => {
      switch (payload.type) {
        case 'globalSearch':
          return { ...previous, globalSearch: payload.filter };
        case 'text': {
          const updatedTextFilters = [...previous.textFilters];

          // Si searchTerm est vide, supprimer le filtre au lieu de le garder
          if (!payload.filter.searchTerm) {
            const filtered = updatedTextFilters.filter(
              (f) => f.columnName !== payload.filter.columnName,
            );
            return { ...previous, textFilters: filtered };
          }

          const existingIndex = updatedTextFilters.findIndex(
            (f) => f.columnName === payload.filter.columnName,
          );
          if (existingIndex >= 0) {
            updatedTextFilters[existingIndex] = payload.filter;
          } else {
            updatedTextFilters.push(payload.filter);
          }

          // Clear date range filter on the same column to avoid conflicts
          const updatedDateRangeFilters = previous.dateRangeFilters.filter(
            (f) => f.columnName !== payload.filter.columnName,
          );

          return {
            ...previous,
            textFilters: updatedTextFilters,
            dateRangeFilters: updatedDateRangeFilters,
          };
        }
        case 'category': {
          const existingIndex = previous.categoryFilters.findIndex(
            (f) => f.columnName === payload.filter.columnName && f.isYearFilter === payload.filter.isYearFilter,
          );
          const updatedCategoryFilters = [...previous.categoryFilters];
          if (existingIndex >= 0) {
            updatedCategoryFilters[existingIndex] = payload.filter;
          } else {
            updatedCategoryFilters.push(payload.filter);
          }

          return { ...previous, categoryFilters: updatedCategoryFilters };
        }
        case 'dateRange': {
          const updatedDateRangeFilters = [...previous.dateRangeFilters];

          // Si startDate, endDate et includeEmpty sont tous vides/false, supprimer le filtre
          if (payload.filter.startDate === null && payload.filter.endDate === null && !payload.filter.includeEmpty) {
            const filtered = updatedDateRangeFilters.filter(
              (f) => f.columnName !== payload.filter.columnName,
            );
            return { ...previous, dateRangeFilters: filtered };
          }

          const existingIndex = updatedDateRangeFilters.findIndex(
            (f) => f.columnName === payload.filter.columnName,
          );
          if (existingIndex >= 0) {
            updatedDateRangeFilters[existingIndex] = payload.filter;
          } else {
            updatedDateRangeFilters.push(payload.filter);
          }

          // Clear text filter on the same column to avoid conflicts
          const updatedTextFilters = previous.textFilters.filter(
            (f) => f.columnName !== payload.filter.columnName,
          );

          return {
            ...previous,
            dateRangeFilters: updatedDateRangeFilters,
            textFilters: updatedTextFilters,
          };
        }
        case 'numberRange': {
          const existingIndex = previous.numberRangeFilters.findIndex(
            (f) => f.columnName === payload.filter.columnName,
          );
          const updatedNumberRangeFilters = [...previous.numberRangeFilters];
          if (existingIndex >= 0) {
            updatedNumberRangeFilters[existingIndex] = payload.filter;
          } else {
            updatedNumberRangeFilters.push(payload.filter);
          }
          return { ...previous, numberRangeFilters: updatedNumberRangeFilters };
        }
        case 'boolean': {
          const existingIndex = previous.booleanFilters.findIndex(
            (f) => f.columnName === payload.filter.columnName,
          );
          const updatedBooleanFilters = [...previous.booleanFilters];
          if (existingIndex >= 0) {
            updatedBooleanFilters[existingIndex] = payload.filter;
          } else {
            updatedBooleanFilters.push(payload.filter);
          }
          return { ...previous, booleanFilters: updatedBooleanFilters };
        }
        case 'multiSelect': {
          const existingIndex = previous.multiSelectFilters.findIndex(
            (f) => f.columnName === payload.filter.columnName,
          );
          const updatedMultiSelectFilters = [...previous.multiSelectFilters];
          if (existingIndex >= 0) {
            updatedMultiSelectFilters[existingIndex] = payload.filter;
          } else {
            updatedMultiSelectFilters.push(payload.filter);
          }
          return { ...previous, multiSelectFilters: updatedMultiSelectFilters };
        }
      }
    });
  }, []);

  const resetFilters = useCallback((): void => {
    setFilterState(createEmptyFilterState());
  }, []);

  const activeFiltersCount = useMemo((): number => {
    let count = 0;
    if (filterState.globalSearch?.searchTerm) count++;
    count += filterState.textFilters.filter((f) => f.searchTerm).length;
    count += filterState.categoryFilters.filter((f) => f.selectedValues.length > 0).length;
    count += filterState.dateRangeFilters.filter((f) => f.startDate || f.endDate || f.includeEmpty).length;
    count += filterState.numberRangeFilters.filter((f) => f.minValue !== null || f.maxValue !== null).length;
    count += filterState.booleanFilters.filter((f) => f.selectedValue !== 'all').length;
    count += filterState.multiSelectFilters.filter((f) => f.selectedValues.length > 0).length;
    return count;
  }, [filterState]);

  return { filterState, updateFilter, resetFilters, activeFiltersCount };
}
