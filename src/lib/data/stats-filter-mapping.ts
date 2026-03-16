import type { FilterUpdatePayload } from '../../hooks/useFilters.ts';
import type { FilterState } from '../../types/ui.types.ts';
import type { StatsPanelConfig } from '../../types/config.types.ts';

interface StatClickDescriptor {
  panelType: StatsPanelConfig['type'];
  columnName: string;
  clickedValue: string;
}

/**
 * Construit le FilterUpdatePayload correspondant à un clic sur une valeur de stats panel.
 * Logique de toggle : ajoute la valeur si absente, la retire si déjà présente.
 */
export function buildFilterPayloadFromStatClick(
  statClick: StatClickDescriptor,
  filterState: FilterState,
): FilterUpdatePayload {
  switch (statClick.panelType) {
    case 'countByColumn':
      return buildCategoryFilterPayload(statClick.columnName, statClick.clickedValue, filterState);
    case 'countByYearFromDate':
      return buildDateRangeFilterPayload(statClick.columnName, statClick.clickedValue, filterState);
    case 'countBySplitValues':
      return buildMultiSelectFilterPayload(statClick.columnName, statClick.clickedValue, filterState);
  }
}

function buildCategoryFilterPayload(
  columnName: string,
  clickedValue: string,
  filterState: FilterState,
): FilterUpdatePayload {
  const existingFilter = filterState.categoryFilters.find((f) => f.columnName === columnName);
  const currentValues = existingFilter?.selectedValues ?? [];
  const isAlreadySelected = currentValues.includes(clickedValue);

  const updatedValues = isAlreadySelected
    ? currentValues.filter((v) => v !== clickedValue)
    : [...currentValues, clickedValue];

  return { type: 'category', filter: { columnName, selectedValues: updatedValues } };
}

function buildDateRangeFilterPayload(
  columnName: string,
  clickedYear: string,
  filterState: FilterState,
): FilterUpdatePayload {
  // Use category filter with isYearFilter flag for both valid years AND invalid dates
  // This allows multi-selection of any combination (e.g., 2020 + 2021 + "0")
  const existingFilter = filterState.categoryFilters.find(
    (f) => f.columnName === columnName && f.isYearFilter,
  );
  const currentValues = existingFilter?.selectedValues ?? [];

  // Handle invalid date values (prefixed with ⚠️)
  let valueToToggle = clickedYear;
  if (clickedYear.startsWith('⚠️ ')) {
    valueToToggle = clickedYear.slice(3); // Remove "⚠️ " prefix for storage
    // Special case: "(vide)" represents empty string in the data
    if (valueToToggle === '(vide)') {
      valueToToggle = '';
    }
  }

  const isAlreadySelected = currentValues.includes(valueToToggle);
  const updatedValues = isAlreadySelected
    ? currentValues.filter((v) => v !== valueToToggle)
    : [...currentValues, valueToToggle];

  return { type: 'category', filter: { columnName, selectedValues: updatedValues, isYearFilter: true } };
}

function buildMultiSelectFilterPayload(
  columnName: string,
  clickedValue: string,
  filterState: FilterState,
): FilterUpdatePayload {
  const existingFilter = filterState.multiSelectFilters.find((f) => f.columnName === columnName);
  const currentValues = existingFilter?.selectedValues ?? [];
  const isAlreadySelected = currentValues.includes(clickedValue);

  const updatedValues = isAlreadySelected
    ? currentValues.filter((v) => v !== clickedValue)
    : [...currentValues, clickedValue];

  return { type: 'multiSelect', filter: { columnName, selectedValues: updatedValues } };
}

/**
 * Vérifie si une valeur de stats panel est actuellement active dans les filtres.
 */
export function isStatValueActiveInFilters(
  panelType: StatsPanelConfig['type'],
  columnName: string,
  value: string,
  filterState: FilterState,
): boolean {
  switch (panelType) {
    case 'countByColumn': {
      const categoryFilter = filterState.categoryFilters.find((f) => f.columnName === columnName);
      return categoryFilter?.selectedValues.includes(value) ?? false;
    }
    case 'countByYearFromDate': {
      // Both valid years and invalid dates are stored in the same category filter
      const yearFilter = filterState.categoryFilters.find(
        (f) => f.columnName === columnName && f.isYearFilter,
      );

      // For invalid dates (prefixed with ⚠️), remove the prefix to check
      let valueToCheck = value.startsWith('⚠️ ') ? value.slice(3) : value;
      // Special case: "(vide)" represents empty string in the data
      if (valueToCheck === '(vide)') {
        valueToCheck = '';
      }
      return yearFilter?.selectedValues.includes(valueToCheck) ?? false;
    }
    case 'countBySplitValues': {
      const multiSelectFilter = filterState.multiSelectFilters.find((f) => f.columnName === columnName);
      return multiSelectFilter?.selectedValues.includes(value) ?? false;
    }
  }
}
