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
  // Handle invalid date values (prefixed with ⚠️)
  if (clickedYear.startsWith('⚠️ ')) {
    const actualValue = clickedYear.slice(3); // Remove "⚠️ " prefix
    // Use text filter for invalid dates
    return { type: 'text', filter: { columnName, searchTerm: actualValue } };
  }

  const existingFilter = filterState.dateRangeFilters.find((f) => f.columnName === columnName);
  const expectedStartDate = `${clickedYear}-01-01`;
  const expectedEndDate = `${clickedYear}-12-31`;

  // Toggle off si le même année est déjà sélectionnée
  const isSameYearActive = existingFilter?.startDate === expectedStartDate
    && existingFilter?.endDate === expectedEndDate;

  if (isSameYearActive) {
    return { type: 'dateRange', filter: { columnName, startDate: null, endDate: null } };
  }

  return { type: 'dateRange', filter: { columnName, startDate: expectedStartDate, endDate: expectedEndDate } };
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
      const dateFilter = filterState.dateRangeFilters.find((f) => f.columnName === columnName);
      return dateFilter?.startDate === `${value}-01-01` && dateFilter?.endDate === `${value}-12-31`;
    }
    case 'countBySplitValues': {
      const multiSelectFilter = filterState.multiSelectFilters.find((f) => f.columnName === columnName);
      return multiSelectFilter?.selectedValues.includes(value) ?? false;
    }
  }
}
