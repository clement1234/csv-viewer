import type { DataRow, InferredColumnSchema, ColumnTypeDetectionResult, ColumnDataType } from '../../types/core.types.ts';
import type { Config } from '../../types/config.types.ts';
import { isValidDateString } from '../utils/date-utils.ts';
import { isStringNumeric, parseStringToNumber } from '../utils/number-utils.ts';
import { detectSeparatorInString, splitStringBySeparator } from '../utils/string-utils.ts';

const DEFAULT_SAMPLE_SIZE = 200;
const SAMPLE_VALUES_COUNT = 5;

export function calculateEmptyValuesRate(values: string[]): number {
  if (values.length === 0) return 0;
  const emptyCount = values.filter((v) => v === '').length;
  return emptyCount / values.length;
}

export function extractDistinctNonEmptyValues(values: string[]): string[] {
  return [...new Set(values.filter((v) => v !== ''))];
}

export function detectColumnTypeFromValues(values: string[]): ColumnTypeDetectionResult {
  const nonEmptyValues = values.filter((v) => v !== '');
  if (nonEmptyValues.length === 0) return { type: 'text' };

  const totalNonEmpty = nonEmptyValues.length;

  // 1. DATE — ≥60% sont des dates valides
  const dateCount = nonEmptyValues.filter(isValidDateString).length;
  if (dateCount / totalNonEmpty >= 0.6) {
    return { type: 'date' };
  }

  // 2. NUMBER — ≥70% sont numériques
  const numericCount = nonEmptyValues.filter(isStringNumeric).length;
  if (numericCount / totalNonEmpty >= 0.7) {
    const parsedNumbers = nonEmptyValues
      .map(parseStringToNumber)
      .filter((n): n is number => n !== null);
    return {
      type: 'number',
      minValue: Math.min(...parsedNumbers),
      maxValue: Math.max(...parsedNumbers),
    };
  }

  // 3. BOOLEAN — ≥80% sont des valeurs booléennes
  const booleanSet = new Set(['oui', 'non', 'true', 'false', '1', '0', 'yes', 'no']);
  const booleanCount = nonEmptyValues.filter((v) => booleanSet.has(v.toLowerCase())).length;
  if (booleanCount / totalNonEmpty >= 0.8) {
    return { type: 'boolean' };
  }

  // 4. MULTI — ≥40% contiennent un séparateur, et les valeurs splittées se répètent
  const separatorCounts = nonEmptyValues
    .map(detectSeparatorInString)
    .filter((sep): sep is '|' | ',' | ';' => sep !== null);

  if (separatorCounts.length / totalNonEmpty >= 0.4) {
    // Trouver le séparateur le plus fréquent
    const separatorFrequency = new Map<string, number>();
    for (const sep of separatorCounts) {
      separatorFrequency.set(sep, (separatorFrequency.get(sep) ?? 0) + 1);
    }
    const dominantSeparator = [...separatorFrequency.entries()]
      .sort((a, b) => b[1] - a[1])[0][0] as '|' | ',' | ';';

    // Vérifier que les valeurs splittées se répètent entre lignes
    const allSplitValues = new Map<string, number>();
    for (const value of nonEmptyValues) {
      const parts = splitStringBySeparator(value, dominantSeparator);
      for (const part of parts) {
        allSplitValues.set(part, (allSplitValues.get(part) ?? 0) + 1);
      }
    }
    const repeatingValues = [...allSplitValues.values()].filter((count) => count > 1).length;
    if (repeatingValues > 0) {
      return { type: 'multi', separatorCharacter: dominantSeparator };
    }
  }

  // 5. CATEGORY — distinctCount ≤ 30 ET ratio < 0.3
  const distinctValues = extractDistinctNonEmptyValues(nonEmptyValues);
  if (distinctValues.length <= 30 && distinctValues.length / values.length < 0.3) {
    return { type: 'category', possibleOptions: distinctValues };
  }

  // 6. TEXT — fallback
  return { type: 'text' };
}

export function inferSchemaFromDataRows(
  data: DataRow[],
  sampleSize: number = DEFAULT_SAMPLE_SIZE,
): InferredColumnSchema[] {
  if (data.length === 0) return [];

  const sampledData = data.slice(0, sampleSize);
  const columnNames = Object.keys(data[0]);

  return columnNames.map((columnName) => {
    const values = sampledData.map((row) => row[columnName] ?? '');
    const detectionResult = detectColumnTypeFromValues(values);
    const distinctValues = extractDistinctNonEmptyValues(values);

    return {
      columnName,
      detectedType: detectionResult.type,
      distinctValuesCount: distinctValues.length,
      emptyValuesRate: calculateEmptyValuesRate(values),
      sampleValues: distinctValues.slice(0, SAMPLE_VALUES_COUNT),
      separatorCharacter: detectionResult.separatorCharacter,
      possibleOptions: detectionResult.possibleOptions,
      minValue: detectionResult.minValue,
      maxValue: detectionResult.maxValue,
    };
  });
}

export function selectDefaultVisibleColumns(
  schema: InferredColumnSchema[],
  max: number = 10,
): string[] {
  return schema
    .filter((col) => col.emptyValuesRate < 0.5)
    .sort((a, b) => a.emptyValuesRate - b.emptyValuesRate)
    .slice(0, max)
    .map((col) => col.columnName);
}

const TYPE_TO_FILTER_KEY: Record<ColumnDataType, keyof NonNullable<Config['filters']> | null> = {
  text: 'text',
  category: 'dropdown',
  date: 'dateRange',
  number: 'numberRange',
  boolean: 'boolean',
  multi: 'multiSelect',
};

export function generateDefaultConfigFromSchema(
  schema: InferredColumnSchema[],
): Partial<Config> {
  const defaultVisible = selectDefaultVisibleColumns(schema);

  const filters: Config['filters'] = {
    globalSearchColumns: schema
      .filter((col) => col.detectedType === 'text' && col.emptyValuesRate < 0.3)
      .slice(0, 5)
      .map((col) => col.columnName),
    text: [],
    dropdown: [],
    dateRange: [],
    numberRange: [],
    boolean: [],
    multiSelect: [],
  };

  for (const col of schema) {
    const filterKey = TYPE_TO_FILTER_KEY[col.detectedType];
    if (filterKey && filters[filterKey]) {
      (filters[filterKey] as string[]).push(col.columnName);
    }
  }

  return {
    columns: { defaultVisible },
    filters,
  };
}
