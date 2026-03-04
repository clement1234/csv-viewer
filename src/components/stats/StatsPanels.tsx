import { useMemo, useCallback } from 'react';
import type { DataRow } from '../../types/core.types.ts';
import type { StatsPanelConfig } from '../../types/config.types.ts';
import type { FilterState } from '../../types/ui.types.ts';
import { isStatValueActiveInFilters } from '../../lib/data/stats-filter-mapping.ts';
import { parseDateStringToDateObject } from '../../lib/utils/date-utils.ts';
import { splitStringBySeparator } from '../../lib/utils/string-utils.ts';

interface StatsPanelsProps {
  panels: StatsPanelConfig[];
  allRows: DataRow[];
  filteredRows: DataRow[];
  filterState: FilterState;
  onStatValueClick: (panelType: StatsPanelConfig['type'], columnName: string, clickedValue: string) => void;
}

type CountMap = Map<string, number>;
type CountDisplay = number | '-';

function countByColumnValues(rows: DataRow[], column: string): CountMap {
  const counts: CountMap = new Map();
  for (const row of rows) {
    const value = row[column] ?? '';
    if (value !== '') {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
}

function countByYearFromDateColumn(rows: DataRow[], column: string): CountMap {
  const counts: CountMap = new Map();
  for (const row of rows) {
    const dateValue = row[column] ?? '';
    if (dateValue === '') continue;
    const dateObj = parseDateStringToDateObject(dateValue);
    if (dateObj) {
      const year = String(dateObj.getFullYear());
      counts.set(year, (counts.get(year) ?? 0) + 1);
    } else {
      // Include invalid dates with a warning prefix
      const invalidKey = `⚠️ ${dateValue}`;
      counts.set(invalidKey, (counts.get(invalidKey) ?? 0) + 1);
    }
  }
  return counts;
}

function countBySplitColumnValues(rows: DataRow[], column: string): CountMap {
  const counts: CountMap = new Map();
  for (const row of rows) {
    const rawValue = row[column] ?? '';
    if (rawValue === '') continue;
    // Détecter le séparateur le plus probable
    const separator = rawValue.includes('|') ? '|' : rawValue.includes(';') ? ';' : ',';
    const parts = splitStringBySeparator(rawValue, separator);
    for (const part of parts) {
      if (part !== '') {
        counts.set(part, (counts.get(part) ?? 0) + 1);
      }
    }
  }
  return counts;
}

function computePanelData(panel: StatsPanelConfig, rows: DataRow[]): CountMap {
  switch (panel.type) {
    case 'countByColumn':
      return countByColumnValues(rows, panel.column);
    case 'countByYearFromDate':
      return countByYearFromDateColumn(rows, panel.column);
    case 'countBySplitValues':
      return countBySplitColumnValues(rows, panel.column);
  }
}

function sortedEntries(
  countMap: Map<string, CountDisplay>,
  panelType: StatsPanelConfig['type'],
): [string, CountDisplay][] {
  const entries = [...countMap.entries()];

  if (panelType === 'countByYearFromDate') {
    // Sort years chronologically (newest first), invalid dates at the end
    return entries.sort((entryA, entryB) => {
      const aKey = entryA[0];
      const bKey = entryB[0];

      const aIsInvalid = aKey.startsWith('⚠️');
      const bIsInvalid = bKey.startsWith('⚠️');

      // Invalid dates go to the end
      if (aIsInvalid && !bIsInvalid) return 1;
      if (!aIsInvalid && bIsInvalid) return -1;

      // Both invalid: sort by count
      if (aIsInvalid && bIsInvalid) {
        const aVal = entryA[1] === '-' ? 0 : entryA[1];
        const bVal = entryB[1] === '-' ? 0 : entryB[1];
        return bVal - aVal;
      }

      // Both are years: sort chronologically (newest first)
      return Number(bKey) - Number(aKey);
    });
  }

  // Default: sort by count (descending)
  return entries.sort((entryA, entryB) => {
    const aVal = entryA[1] === '-' ? 0 : entryA[1];
    const bVal = entryB[1] === '-' ? 0 : entryB[1];
    return bVal - aVal;
  });
}

interface PanelTableProps {
  label: string;
  data: Map<string, CountDisplay>;
  panelType: StatsPanelConfig['type'];
  columnName: string;
  filterState: FilterState;
  onValueClick: (value: string) => void;
}

function PanelTable({ label, data, panelType, columnName, filterState, onValueClick }: PanelTableProps): React.JSX.Element {
  const entries = useMemo(() => sortedEntries(data, panelType), [data, panelType]);

  const handleRowKeyDown = useCallback((event: React.KeyboardEvent, value: string): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onValueClick(value);
    }
  }, [onValueClick]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <h3 className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">
        {label}
      </h3>
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([value, count], index) => {
            const isActive = isStatValueActiveInFilters(panelType, columnName, value, filterState);
            return (
              <tr
                key={`${columnName}-${value}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => onValueClick(value)}
                onKeyDown={(event) => handleRowKeyDown(event, value)}
                className={`border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-blue-100 font-semibold text-blue-800'
                    : 'hover:bg-blue-50'
                }`}
              >
                <td className="px-4 py-2">{value}</td>
                <td className="px-4 py-2 text-right font-medium">{count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StatsPanels({ panels, allRows, filteredRows, filterState, onStatValueClick }: StatsPanelsProps): React.JSX.Element | null {
  const panelDataList = useMemo(
    () => panels.map((panel) => {
      const allValuesMap = computePanelData(panel, allRows);
      const filteredValuesMap = computePanelData(panel, filteredRows);

      const mergedMap: Map<string, CountDisplay> = new Map();
      for (const [value] of allValuesMap) {
        const filteredCount = filteredValuesMap.get(value) ?? 0;
        mergedMap.set(value, filteredCount === 0 ? '-' : filteredCount);
      }

      return mergedMap;
    }),
    [panels, allRows, filteredRows],
  );

  if (panels.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {panels.map((panel, panelIndex) => (
        <PanelTable
          key={`${panel.type}-${panel.column}-${panelIndex}`}
          label={panel.label}
          data={panelDataList[panelIndex]}
          panelType={panel.type}
          columnName={panel.column}
          filterState={filterState}
          onValueClick={(value) => onStatValueClick(panel.type, panel.column, value)}
        />
      ))}
    </div>
  );
}
