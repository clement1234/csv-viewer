export type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
export type BadgeVariant = 'solid' | 'outline' | 'subtle';
export type LinkType = 'mailto' | 'tel' | 'url';

export interface AppConfig {
  title?: string;
  subtitle?: string;
}

export interface CSVConfig {
  delimiter?: string;
}

export interface MatchConfig {
  expectedHeaders?: string[];
  strictMode?: boolean;
}

export type ColumnFormatConfig =
  | { type: 'date'; inputFormat?: DateFormat; outputFormat?: DateFormat }
  | { type: 'badge'; map: Record<string, { color: string; variant: BadgeVariant }> }
  | { type: 'splitBadges'; separator: '|' | ',' | ';' }
  | { type: 'link'; linkType: LinkType };

export type ComputedColumnConfig = {
  type: 'ageFromDate';
  sourceColumn: string;
  dateFormat: 'excel' | DateFormat;
};

export interface ComputedColumnsConfig {
  [columnName: string]: ComputedColumnConfig;
}

export interface ColumnsConfig {
  defaultVisible?: string[];
  labels?: Record<string, string>;
  aliases?: Record<string, string>;
  formats?: Record<string, ColumnFormatConfig>;
  computed?: ComputedColumnsConfig;
}

export interface FiltersConfig {
  globalSearchColumns?: string[];
  dropdown?: string[];
  text?: string[];
  dateRange?: string[];
  numberRange?: string[];
  boolean?: string[];
  multiSelect?: string[];
}

export type StatsCardConfig =
  | { type: 'count'; label: string }
  | { type: 'countWhere'; label: string; column: string; value: string };

export type StatsPanelConfig =
  | { type: 'countByColumn'; column: string; label: string }
  | { type: 'countByYearFromDate'; column: string; label: string }
  | { type: 'countBySplitValues'; column: string; label: string }
  | { type: 'numericStats'; column: string; label: string; unit?: string };

export interface StatsConfig {
  cards?: StatsCardConfig[];
  panels?: StatsPanelConfig[];
}

export interface DetailModalSection {
  title: string;
  fields: string[];
}

export interface DetailModalConfig {
  titleTemplate?: string;
  sections?: DetailModalSection[];
}

export interface Config {
  app?: AppConfig;
  csv?: CSVConfig;
  match?: MatchConfig;
  columns?: ColumnsConfig;
  filters?: FiltersConfig;
  stats?: StatsConfig;
  detailModal?: DetailModalConfig;
}
