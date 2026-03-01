/** Ligne de données normalisée — toutes valeurs en string */
export type DataRow = Record<string, string>;

/** Ligne brute avant normalisation (parsing XLSX) */
export type RawDataRow = Record<string, unknown>;

/** Types de colonnes détectables */
export type ColumnDataType = 'date' | 'number' | 'boolean' | 'category' | 'multi' | 'text';

/** Schéma inféré d'une colonne */
export interface InferredColumnSchema {
  columnName: string;
  detectedType: ColumnDataType;
  distinctValuesCount: number;
  emptyValuesRate: number;
  sampleValues: string[];
  separatorCharacter?: '|' | ',' | ';';
  possibleOptions?: string[];
  minValue?: number;
  maxValue?: number;
}

/** Résultat de détection de type */
export interface ColumnTypeDetectionResult {
  type: ColumnDataType;
  separatorCharacter?: '|' | ',' | ';';
  possibleOptions?: string[];
  minValue?: number;
  maxValue?: number;
}
