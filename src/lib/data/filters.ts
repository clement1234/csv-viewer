import type { DataRow, InferredColumnSchema } from '../../types/core.types.ts';
import type { FilterState } from '../../types/ui.types.ts';
import { parseDateStringToDateObject } from '../utils/date-utils.ts';
import { parseStringToNumber } from '../utils/number-utils.ts';
import { splitStringBySeparator } from '../utils/string-utils.ts';

const TRUTHY_VALUES = new Set(['oui', 'true', '1', 'yes']);
const FALSY_VALUES = new Set(['non', 'false', '0', 'no']);

function applyGlobalSearchFilter(
  data: DataRow[],
  searchTerm: string,
  targetColumns: string[],
): DataRow[] {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return data.filter((row) =>
    targetColumns.some((col) =>
      (row[col] ?? '').toLowerCase().includes(lowerSearchTerm),
    ),
  );
}

function applyTextFilters(data: DataRow[], filters: FilterState['textFilters']): DataRow[] {
  let result = data;
  for (const filter of filters) {
    if (!filter.searchTerm) continue;
    const lowerSearch = filter.searchTerm.toLowerCase();

    if (filter.exactMatch) {
      // Exact match: compare the entire cell value
      result = result.filter((row) =>
        (row[filter.columnName] ?? '').toLowerCase() === lowerSearch,
      );
    } else {
      // Substring match: default behavior
      result = result.filter((row) =>
        (row[filter.columnName] ?? '').toLowerCase().includes(lowerSearch),
      );
    }
  }
  return result;
}

function applyCategoryFilters(data: DataRow[], filters: FilterState['categoryFilters']): DataRow[] {
  let result = data;
  for (const filter of filters) {
    if (filter.selectedValues.length === 0) continue;
    const selectedSet = new Set(filter.selectedValues);
    result = result.filter((row) => selectedSet.has(row[filter.columnName] ?? ''));
  }
  return result;
}

function applyDateRangeFilters(data: DataRow[], filters: FilterState['dateRangeFilters']): DataRow[] {
  let result = data;
  for (const filter of filters) {
    if (filter.startDate === null && filter.endDate === null) continue;
    const startDate = filter.startDate ? parseDateStringToDateObject(filter.startDate) : null;
    const endDate = filter.endDate ? parseDateStringToDateObject(filter.endDate) : null;

    result = result.filter((row) => {
      const dateValue = parseDateStringToDateObject(row[filter.columnName] ?? '');
      if (!dateValue) return false;
      if (startDate && dateValue < startDate) return false;
      if (endDate && dateValue > endDate) return false;
      return true;
    });
  }
  return result;
}

function applyNumberRangeFilters(data: DataRow[], filters: FilterState['numberRangeFilters']): DataRow[] {
  let result = data;
  for (const filter of filters) {
    if (filter.minValue === null && filter.maxValue === null) continue;

    result = result.filter((row) => {
      const numValue = parseStringToNumber(row[filter.columnName] ?? '');
      if (numValue === null) return false;
      if (filter.minValue !== null && numValue < filter.minValue) return false;
      if (filter.maxValue !== null && numValue > filter.maxValue) return false;
      return true;
    });
  }
  return result;
}

function applyBooleanFilters(data: DataRow[], filters: FilterState['booleanFilters']): DataRow[] {
  let result = data;
  for (const filter of filters) {
    if (filter.selectedValue === 'all') continue;

    result = result.filter((row) => {
      const rawValue = (row[filter.columnName] ?? '').toLowerCase();
      if (filter.selectedValue === 'true') {
        return TRUTHY_VALUES.has(rawValue);
      }
      return FALSY_VALUES.has(rawValue);
    });
  }
  return result;
}

function applyMultiSelectFilters(
  data: DataRow[],
  filters: FilterState['multiSelectFilters'],
  schema: InferredColumnSchema[],
): DataRow[] {
  let result = data;
  for (const filter of filters) {
    if (filter.selectedValues.length === 0) continue;

    const colSchema = schema.find((s) => s.columnName === filter.columnName);
    const separator = colSchema?.separatorCharacter ?? '|';
    const selectedSet = new Set(filter.selectedValues);

    result = result.filter((row) => {
      const rawValue = row[filter.columnName] ?? '';
      const parts = splitStringBySeparator(rawValue, separator);
      return parts.some((part) => selectedSet.has(part));
    });
  }
  return result;
}

export function applyAllFiltersToDataRows(
  data: DataRow[],
  filterState: FilterState,
  schema: InferredColumnSchema[],
): DataRow[] {
  let result = data;

  if (filterState.globalSearch?.searchTerm) {
    result = applyGlobalSearchFilter(
      result,
      filterState.globalSearch.searchTerm,
      filterState.globalSearch.targetColumns,
    );
  }

  result = applyTextFilters(result, filterState.textFilters);
  result = applyCategoryFilters(result, filterState.categoryFilters);
  result = applyDateRangeFilters(result, filterState.dateRangeFilters);
  result = applyNumberRangeFilters(result, filterState.numberRangeFilters);
  result = applyBooleanFilters(result, filterState.booleanFilters);
  result = applyMultiSelectFilters(result, filterState.multiSelectFilters, schema);

  return result;
}
