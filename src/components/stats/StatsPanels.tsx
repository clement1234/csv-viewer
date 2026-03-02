import { useMemo } from 'react';
import type { DataRow } from '../../types/core.types.ts';
import type { StatsPanelConfig } from '../../types/config.types.ts';
import { parseDateStringToDateObject } from '../../lib/utils/date-utils.ts';
import { splitStringBySeparator } from '../../lib/utils/string-utils.ts';

interface StatsPanelsProps {
  panels: StatsPanelConfig[];
  rows: DataRow[];
}

type CountMap = Map<string, number>;

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

function sortedEntries(countMap: CountMap): [string, number][] {
  return [...countMap.entries()].sort((entryA, entryB) => entryB[1] - entryA[1]);
}

function PanelTable({ label, data }: { label: string; data: CountMap }): React.JSX.Element {
  const entries = useMemo(() => sortedEntries(data), [data]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <h3 className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">
        {label}
      </h3>
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([value, count]) => (
            <tr key={value} className="border-b border-gray-100 last:border-b-0">
              <td className="px-4 py-2 text-gray-700">{value}</td>
              <td className="px-4 py-2 text-right font-medium text-gray-900">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatsPanels({ panels, rows }: StatsPanelsProps): React.JSX.Element | null {
  const panelDataList = useMemo(
    () => panels.map((panel) => computePanelData(panel, rows)),
    [panels, rows],
  );

  if (panels.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {panels.map((panel, panelIndex) => (
        <PanelTable key={panel.label} label={panel.label} data={panelDataList[panelIndex]} />
      ))}
    </div>
  );
}
