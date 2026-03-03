import { describe, it, expect } from 'vitest';
import {
  applyConfigToSchemaAndData,
  applyColumnAliasesToDataRows,
} from '../config-applicator.ts';
import type { Config } from '../../../types/config.types.ts';
import type { DataRow, InferredColumnSchema } from '../../../types/core.types.ts';
import { createMockInferredSchema } from '../../../test/factories/data.factory.ts';

function createTestData(): DataRow[] {
  return [
    { nom: 'Dupont', prenom: 'Jean', age: '30' },
    { nom: 'Martin', prenom: 'Paul', age: '25' },
  ];
}

function createTestSchema(): InferredColumnSchema[] {
  return [
    createMockInferredSchema({ columnName: 'nom' }),
    createMockInferredSchema({ columnName: 'prenom' }),
    createMockInferredSchema({ columnName: 'age', detectedType: 'number' }),
  ];
}

describe('applyColumnAliasesToDataRows', () => {
  it('should rename columns according to aliases', () => {
    const data = createTestData();
    const result = applyColumnAliasesToDataRows(data, { nom: 'name' });
    expect(result[0]['name']).toBe('Dupont');
    expect(result[0]['nom']).toBeUndefined();
  });

  it('should not mutate original data', () => {
    const data = createTestData();
    applyColumnAliasesToDataRows(data, { nom: 'name' });
    expect(data[0]['nom']).toBe('Dupont');
  });

  it('should keep columns without aliases unchanged', () => {
    const data = createTestData();
    const result = applyColumnAliasesToDataRows(data, { nom: 'name' });
    expect(result[0]['prenom']).toBe('Jean');
    expect(result[0]['age']).toBe('30');
  });
});

describe('applyConfigToSchemaAndData', () => {
  it('should return applied config without warnings when columns match', () => {
    const config: Config = {
      match: { expectedHeaders: ['nom', 'prenom', 'age'] },
    };
    const result = applyConfigToSchemaAndData(config, createTestSchema(), createTestData());
    expect(result.warnings).toHaveLength(0);
  });

  it('should warn when some expected headers are missing (less than 50%)', () => {
    const config: Config = {
      match: { expectedHeaders: ['nom', 'prenom', 'age', 'missing'] },
    };
    const result = applyConfigToSchemaAndData(config, createTestSchema(), createTestData());
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should throw error when ≥50% headers missing with strictMode', () => {
    const config: Config = {
      match: {
        expectedHeaders: ['missing1', 'missing2', 'missing3', 'nom'],
        strictMode: true,
      },
    };
    expect(() =>
      applyConfigToSchemaAndData(config, createTestSchema(), createTestData()),
    ).toThrow();
  });

  it('should warn but not throw when ≥50% missing without strictMode', () => {
    const config: Config = {
      match: {
        expectedHeaders: ['missing1', 'missing2', 'missing3', 'nom'],
        strictMode: false,
      },
    };
    const result = applyConfigToSchemaAndData(config, createTestSchema(), createTestData());
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should apply column aliases to data rows', () => {
    const config: Config = {
      columns: { aliases: { nom: 'name' } },
    };
    const result = applyConfigToSchemaAndData(config, createTestSchema(), createTestData());
    expect(result.normalizedData[0]['name']).toBe('Dupont');
  });

  it('should merge user config with auto-generated config (user takes priority)', () => {
    const config: Config = {
      columns: { defaultVisible: ['nom'] },
    };
    const result = applyConfigToSchemaAndData(config, createTestSchema(), createTestData());
    expect(result.appliedConfig.columns?.defaultVisible).toEqual(['nom']);
  });

  it('should preserve data when no aliases are defined', () => {
    const config: Config = {};
    const data = createTestData();
    const result = applyConfigToSchemaAndData(config, createTestSchema(), data);
    expect(result.normalizedData).toEqual(data);
  });

  it('should generate default config when user config is empty', () => {
    const config: Config = {};
    const result = applyConfigToSchemaAndData(config, createTestSchema(), createTestData());
    expect(result.appliedConfig.filters).toBeDefined();
    expect(result.appliedConfig.columns?.defaultVisible).toBeDefined();
  });

  it('should not overwrite user-defined filters with auto-generated ones', () => {
    const config: Config = {
      filters: { text: ['nom'] },
    };
    const result = applyConfigToSchemaAndData(config, createTestSchema(), createTestData());
    expect(result.appliedConfig.filters?.text).toEqual(['nom']);
  });
});
