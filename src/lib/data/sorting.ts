import type { DataRow, InferredColumnSchema } from '../../types/core.types.ts';
import type { SortState } from '../../types/ui.types.ts';
import { parseDateStringToDateObject } from '../utils/date-utils.ts';
import { parseStringToNumber } from '../utils/number-utils.ts';

const TRUTHY_VALUES = new Set(['oui', 'true', '1', 'yes']);

export function sortDataRowsByColumn(
  data: DataRow[],
  sortState: SortState,
  schema: InferredColumnSchema[],
): DataRow[] {
  if (!sortState.columnName || !sortState.direction) return data;

  const { columnName, direction } = sortState;
  const colSchema = schema.find((s) => s.columnName === columnName);
  const colType = colSchema?.detectedType ?? 'text';
  const multiplier = direction === 'asc' ? 1 : -1;

  const sorted = [...data];
  sorted.sort((rowA, rowB) => {
    const valueA = rowA[columnName] ?? '';
    const valueB = rowB[columnName] ?? '';

    switch (colType) {
      case 'date': {
        const dateA = parseDateStringToDateObject(valueA);
        const dateB = parseDateStringToDateObject(valueB);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return (dateA.getTime() - dateB.getTime()) * multiplier;
      }
      case 'number': {
        const numA = parseStringToNumber(valueA);
        const numB = parseStringToNumber(valueB);
        if (numA === null && numB === null) return 0;
        if (numA === null) return 1;
        if (numB === null) return -1;
        return (numA - numB) * multiplier;
      }
      case 'boolean': {
        const boolA = TRUTHY_VALUES.has(valueA.toLowerCase()) ? 1 : 0;
        const boolB = TRUTHY_VALUES.has(valueB.toLowerCase()) ? 1 : 0;
        return (boolA - boolB) * multiplier;
      }
      default: {
        return valueA.localeCompare(valueB) * multiplier;
      }
    }
  });

  return sorted;
}
