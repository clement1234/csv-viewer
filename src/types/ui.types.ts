export interface GlobalSearchFilter {
  searchTerm: string;
  targetColumns: string[];
}

export interface TextFilter {
  columnName: string;
  searchTerm: string;
}

export interface CategoryFilter {
  columnName: string;
  selectedValues: string[];
}

export interface DateRangeFilter {
  columnName: string;
  startDate: string | null;
  endDate: string | null;
}

export interface NumberRangeFilter {
  columnName: string;
  minValue: number | null;
  maxValue: number | null;
}

export interface BooleanFilter {
  columnName: string;
  selectedValue: 'all' | 'true' | 'false';
}

export interface MultiSelectFilter {
  columnName: string;
  selectedValues: string[];
}

export interface FilterState {
  globalSearch?: GlobalSearchFilter;
  textFilters: TextFilter[];
  categoryFilters: CategoryFilter[];
  dateRangeFilters: DateRangeFilter[];
  numberRangeFilters: NumberRangeFilter[];
  booleanFilters: BooleanFilter[];
  multiSelectFilters: MultiSelectFilter[];
}

export interface SortState {
  columnName: string | null;
  direction: 'asc' | 'desc' | null;
}

export interface PaginationState {
  currentPage: number;
  rowsPerPage: 25 | 50 | 100 | 200;
}
