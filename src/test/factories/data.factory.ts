import type { DataRow, InferredColumnSchema, ColumnDataType } from '../../types/core.types.ts';

export function createMockDataRow(overrides?: Partial<DataRow>): DataRow {
  return {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    ...overrides,
  };
}

export function createMockDataRowArray(
  count: number,
  generator?: (index: number) => Partial<DataRow>,
): DataRow[] {
  return Array.from({ length: count }, (_, index) =>
    createMockDataRow(generator ? generator(index) : { nom: `Nom_${index}` }),
  );
}

export function createMockInferredSchema(
  overrides?: Partial<InferredColumnSchema>,
): InferredColumnSchema {
  return {
    columnName: 'nom',
    detectedType: 'text' as ColumnDataType,
    distinctValuesCount: 10,
    emptyValuesRate: 0,
    sampleValues: ['Dupont', 'Martin', 'Durand'],
    ...overrides,
  };
}
