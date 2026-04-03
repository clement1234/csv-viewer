import { useMemo, useCallback } from 'react';
import type { DataRow } from '../../types/core.types.ts';
import type { StatsPanelConfig } from '../../types/config.types.ts';
import type { FilterState } from '../../types/ui.types.ts';
import { isStatValueActiveInFilters } from '../../lib/data/stats-filter-mapping.ts';
import { parseDateStringToDateObject } from '../../lib/utils/date-utils.ts';
import { splitStringBySeparator } from '../../lib/utils/string-utils.ts';
import {
  extractNumericValuesFromColumn,
  calculateNumericStats,
  type NumericStatsResult,
} from '../../lib/data/numeric-stats.ts';

interface StatsPanelsProps {
  panels: StatsPanelConfig[];
  allRows: DataRow[];
  filteredRows: DataRow[];
  filterState: FilterState;
  onStatValueClick: (panelType: StatsPanelConfig['type'], columnName: string, clickedValue: string) => void;
}

type CountMap = Map<string, number>;
type CountDisplay = number | '-';

interface PanelData {
  type: 'count' | 'numeric';
  countMap?: CountMap;
  stats?: NumericStatsResult | null;
}

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
    if (dateValue === '') {
      // Count empty dates as a special invalid category
      const emptyKey = '⚠️ (vide)';
      counts.set(emptyKey, (counts.get(emptyKey) ?? 0) + 1);
      continue;
    }
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

function computePanelData(panel: StatsPanelConfig, rows: DataRow[]): PanelData {
  if (panel.type === 'numericStats') {
    const values = extractNumericValuesFromColumn(rows, panel.column);
    const stats = calculateNumericStats(values);
    return { type: 'numeric', stats };
  }

  let countMap: CountMap;
  switch (panel.type) {
    case 'countByColumn':
      countMap = countByColumnValues(rows, panel.column);
      break;
    case 'countByYearFromDate':
      countMap = countByYearFromDateColumn(rows, panel.column);
      break;
    case 'countBySplitValues':
      countMap = countBySplitColumnValues(rows, panel.column);
      break;
  }

  return { type: 'count', countMap };
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

interface NumericStatsPanelProps {
  label: string;
  stats: NumericStatsResult | null;
  unit?: string;
}

function NumericStatsPanel({ label, stats, unit }: NumericStatsPanelProps): React.JSX.Element {
  const formatValue = (value: number): string => {
    const formatted = value.toFixed(1);
    return unit ? `${formatted} ${unit}` : formatted;
  };

  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <h3 className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">
          {label}
        </h3>
        <div className="px-4 py-8 text-center text-sm text-gray-500">
          Aucune donnée numérique disponible
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <h3 className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">
        {label}
      </h3>
      <dl className="px-4 py-3 space-y-2 text-sm">
        <div className="flex justify-between py-1">
          <dt className="text-gray-600">Moyenne</dt>
          <dd className="font-medium text-gray-900">{formatValue(stats.mean)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-gray-600">Min</dt>
          <dd className="font-medium text-gray-900">{formatValue(stats.min)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-gray-600">Q1 (25%)</dt>
          <dd className="font-medium text-gray-900">{formatValue(stats.q1)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-gray-600">Q2 (50%)</dt>
          <dd className="font-medium text-gray-900">{formatValue(stats.q2)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-gray-600">Q3 (75%)</dt>
          <dd className="font-medium text-gray-900">{formatValue(stats.q3)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-gray-600">Q4 (100%)</dt>
          <dd className="font-medium text-gray-900">{formatValue(stats.q4)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-gray-600">Écart-type</dt>
          <dd className="font-medium text-gray-900">{formatValue(stats.stdDev)}</dd>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
          <dt className="text-gray-500 text-xs">Nombre de valeurs</dt>
          <dd className="text-gray-500 text-xs">{stats.count}</dd>
        </div>
      </dl>
    </div>
  );
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
      const filteredData = computePanelData(panel, filteredRows);

      // Pour les panels numericStats, on utilise directement les données filtrées
      if (filteredData.type === 'numeric') {
        return filteredData;
      }

      // Pour les panels de comptage, on merge avec les données complètes
      const allData = computePanelData(panel, allRows);
      const mergedMap: Map<string, CountDisplay> = new Map();

      if (allData.type === 'count' && allData.countMap && filteredData.countMap) {
        for (const [value] of allData.countMap) {
          const filteredCount = filteredData.countMap.get(value) ?? 0;
          mergedMap.set(value, filteredCount === 0 ? '-' : filteredCount);
        }
      }

      return { type: 'count' as const, countMap: mergedMap };
    }),
    [panels, allRows, filteredRows],
  );

  if (panels.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {panels.map((panel, panelIndex) => {
        const panelData = panelDataList[panelIndex];

        // Rendu spécifique pour numericStats
        if (panel.type === 'numericStats' && panelData.type === 'numeric') {
          return (
            <NumericStatsPanel
              key={`${panel.type}-${panel.column}-${panelIndex}`}
              label={panel.label}
              stats={panelData.stats ?? null}
              unit={panel.unit}
            />
          );
        }

        // Rendu pour les autres types de panels
        if (panelData.type === 'count' && panelData.countMap) {
          return (
            <PanelTable
              key={`${panel.type}-${panel.column}-${panelIndex}`}
              label={panel.label}
              data={panelData.countMap}
              panelType={panel.type}
              columnName={panel.column}
              filterState={filterState}
              onValueClick={(value) => onStatValueClick(panel.type, panel.column, value)}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
