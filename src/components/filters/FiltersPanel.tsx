import { useState } from 'react';
import type { DataRow, InferredColumnSchema } from '../../types/core.types.ts';
import type { Config } from '../../types/config.types.ts';
import type {
  FilterState,
  GlobalSearchFilter,
  TextFilter as TextFilterType,
  CategoryFilter as CategoryFilterType,
  DateRangeFilter as DateRangeFilterType,
  NumberRangeFilter as NumberRangeFilterType,
  BooleanFilter as BooleanFilterType,
  MultiSelectFilter as MultiSelectFilterType,
} from '../../types/ui.types.ts';
import { FilterIcon, ChevronDownIcon, ChevronUpIcon, SearchIcon } from '../ui/Icons.tsx';
import { Button } from '../ui/Button.tsx';
import { TextFilter } from './TextFilter.tsx';
import { CategoryFilter } from './CategoryFilter.tsx';
import { DateRangeFilter } from './DateRangeFilter.tsx';
import { NumberRangeFilter } from './NumberRangeFilter.tsx';
import { BooleanFilter } from './BooleanFilter.tsx';

type FilterUpdatePayload =
  | { type: 'globalSearch'; filter: GlobalSearchFilter }
  | { type: 'text'; filter: TextFilterType }
  | { type: 'category'; filter: CategoryFilterType }
  | { type: 'dateRange'; filter: DateRangeFilterType }
  | { type: 'numberRange'; filter: NumberRangeFilterType }
  | { type: 'boolean'; filter: BooleanFilterType }
  | { type: 'multiSelect'; filter: MultiSelectFilterType };

interface FiltersPanelProps {
  schema: InferredColumnSchema[];
  config: Config;
  filterState: FilterState;
  onUpdateFilter: (payload: FilterUpdatePayload) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
  data: DataRow[];
}

export function FiltersPanel({
  schema,
  config,
  filterState,
  onUpdateFilter,
  onResetFilters,
  activeFiltersCount,
  data,
}: FiltersPanelProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const filters = config.filters;

  const globalSearchColumns = filters?.globalSearchColumns ?? [];
  const textColumns = filters?.text ?? [];
  const dropdownColumns = filters?.dropdown ?? [];
  const dateRangeColumns = filters?.dateRange ?? [];
  const numberRangeColumns = filters?.numberRange ?? [];
  const booleanColumns = filters?.boolean ?? [];

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FilterIcon size={18} className="text-gray-500" />
          <span className="font-medium text-gray-700">Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* Recherche globale */}
          {globalSearchColumns.length > 0 && (
            <div className="pt-4">
              <div className="relative">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filterState.globalSearch?.searchTerm ?? ''}
                  onChange={(event) =>
                    onUpdateFilter({
                      type: 'globalSearch',
                      filter: { searchTerm: event.target.value, targetColumns: globalSearchColumns },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Recherche globale"
                />
              </div>
            </div>
          )}

          {/* Filtres texte */}
          {textColumns.map((col) => (
            <TextFilter
              key={col}
              columnName={col}
              label={config.columns?.labels?.[col] ?? col}
              value={filterState.textFilters.find((f) => f.columnName === col)?.searchTerm ?? ''}
              onChange={(searchTerm) =>
                onUpdateFilter({ type: 'text', filter: { columnName: col, searchTerm } })
              }
            />
          ))}

          {/* Filtres catégorie */}
          {dropdownColumns.map((col) => {
            const colSchema = schema.find((s) => s.columnName === col);
            const options = colSchema?.possibleOptions ?? [...new Set(data.map((row) => row[col]).filter(Boolean))];
            return (
              <CategoryFilter
                key={col}
                columnName={col}
                label={config.columns?.labels?.[col] ?? col}
                options={options}
                selectedValues={filterState.categoryFilters.find((f) => f.columnName === col)?.selectedValues ?? []}
                onChange={(selectedValues) =>
                  onUpdateFilter({ type: 'category', filter: { columnName: col, selectedValues } })
                }
              />
            );
          })}

          {/* Filtres date range */}
          {dateRangeColumns.map((col) => {
            const existing = filterState.dateRangeFilters.find((f) => f.columnName === col);
            return (
              <DateRangeFilter
                key={col}
                columnName={col}
                label={config.columns?.labels?.[col] ?? col}
                startDate={existing?.startDate ?? null}
                endDate={existing?.endDate ?? null}
                onChange={(startDate, endDate) =>
                  onUpdateFilter({ type: 'dateRange', filter: { columnName: col, startDate, endDate } })
                }
              />
            );
          })}

          {/* Filtres number range */}
          {numberRangeColumns.map((col) => {
            const existing = filterState.numberRangeFilters.find((f) => f.columnName === col);
            const colSchema = schema.find((s) => s.columnName === col);
            return (
              <NumberRangeFilter
                key={col}
                columnName={col}
                label={config.columns?.labels?.[col] ?? col}
                minValue={existing?.minValue ?? null}
                maxValue={existing?.maxValue ?? null}
                schemaMin={colSchema?.minValue}
                schemaMax={colSchema?.maxValue}
                onChange={(minValue, maxValue) =>
                  onUpdateFilter({ type: 'numberRange', filter: { columnName: col, minValue, maxValue } })
                }
              />
            );
          })}

          {/* Filtres booléens */}
          {booleanColumns.map((col) => {
            const existing = filterState.booleanFilters.find((f) => f.columnName === col);
            return (
              <BooleanFilter
                key={col}
                columnName={col}
                label={config.columns?.labels?.[col] ?? col}
                selectedValue={existing?.selectedValue ?? 'all'}
                onChange={(selectedValue) =>
                  onUpdateFilter({ type: 'boolean', filter: { columnName: col, selectedValue } })
                }
              />
            );
          })}

          {/* Reset */}
          {activeFiltersCount > 0 && (
            <div className="pt-2">
              <Button variant="ghost" size="sm" onClick={onResetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
