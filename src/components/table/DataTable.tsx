import type { DataRow, InferredColumnSchema } from '../../types/core.types.ts';
import type { Config } from '../../types/config.types.ts';
import type { SortState } from '../../types/ui.types.ts';
import { formatCellValueForDisplay, type FormattedCellValue } from '../../lib/utils/cell-formatters.ts';
import { ChevronUpIcon, ChevronDownIcon } from '../ui/Icons.tsx';

interface DataTableProps {
  data: DataRow[];
  visibleColumns: string[];
  columnLabels?: Record<string, string>;
  schema: InferredColumnSchema[];
  config: Config;
  sortState: SortState;
  onSortChange: (columnName: string) => void;
  onRowClick: (row: DataRow, index: number) => void;
}

function CellRenderer({ formatted }: { formatted: FormattedCellValue }): React.JSX.Element {
  switch (formatted.type) {
    case 'badge':
      return (
        <span
          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full`}
          style={{
            backgroundColor: `var(--color-badge-${formatted.color}, ${formatted.color})`,
            color: formatted.variant === 'solid' ? 'white' : 'inherit',
            border: formatted.variant === 'outline' ? `1px solid var(--color-badge-${formatted.color}, ${formatted.color})` : undefined,
            opacity: formatted.variant === 'subtle' ? 0.8 : 1,
          }}
        >
          {formatted.value}
        </span>
      );
    case 'chips':
      return (
        <div className="flex flex-wrap gap-1">
          {formatted.values.map((chip, index) => (
            <span
              key={`${chip}-${index}`}
              className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              {chip}
            </span>
          ))}
        </div>
      );
    case 'link':
      return (
        <a
          href={formatted.href}
          className="text-blue-600 hover:underline"
          onClick={(event) => event.stopPropagation()}
          target={formatted.linkType === 'url' ? '_blank' : undefined}
          rel={formatted.linkType === 'url' ? 'noopener noreferrer' : undefined}
        >
          {formatted.value}
        </a>
      );
    case 'date':
      return <span title={formatted.originalValue}>{formatted.value}</span>;
    default:
      return <span>{formatted.value}</span>;
  }
}

function SortIndicator({ columnName, sortState }: { columnName: string; sortState: SortState }): React.JSX.Element | null {
  if (sortState.columnName !== columnName) return null;
  return sortState.direction === 'asc'
    ? <ChevronUpIcon size={14} className="inline ml-1" />
    : <ChevronDownIcon size={14} className="inline ml-1" />;
}

export function DataTable({
  data,
  visibleColumns,
  columnLabels,
  schema,
  config,
  sortState,
  onSortChange,
  onRowClick,
}: DataTableProps): React.JSX.Element {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {visibleColumns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => onSortChange(col)}
              >
                {columnLabels?.[col] ?? col}
                <SortIndicator columnName={col} sortState={sortState} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => onRowClick(row, rowIndex)}
            >
              {visibleColumns.map((col) => {
                const formatted = formatCellValueForDisplay(row[col] ?? '', col, config, schema);
                return (
                  <td key={col} className="px-4 py-3 whitespace-nowrap">
                    <CellRenderer formatted={formatted} />
                  </td>
                );
              })}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={visibleColumns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                Aucune donnée à afficher
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
