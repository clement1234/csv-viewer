import { describe, it, expect } from 'vitest';
import {
  generateSchemaFingerprintFromData,
  calculateConfigMatchScore,
  findBestMatchingConfig,
} from '../config-matcher';
import type { InferredColumnSchema } from '../../../types/core.types';
import type { Config } from '../../../types/config.types';
import type { StoredConfig } from '../../../types/storage.types';

describe('config-matcher', () => {
  const mockConfig: Config = {
    app: { title: 'Test' },
    columns: {},
    filters: {},
    stats: { cards: [] },
  };

  describe('generateSchemaFingerprintFromData', () => {
    it('should generate fingerprint with normalized column names', () => {
      const schema: InferredColumnSchema[] = [
        { columnName: 'Nom Complet', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
        { columnName: 'Âge', detectedType: 'number', distinctValuesCount: 5, emptyValuesRate: 0, sampleValues: [] },
        { columnName: 'Email', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
      ];

      const fingerprint = generateSchemaFingerprintFromData(schema);

      expect(fingerprint.expectedColumns).toEqual([
        'nom_complet',
        'age',
        'email',
      ]);
      expect(fingerprint.columnTypes).toEqual({
        nom_complet: 'text',
        age: 'number',
        email: 'text',
      });
      expect(fingerprint.columnCount).toBe(3);
    });

    it('should handle empty schema', () => {
      const schema: InferredColumnSchema[] = [];

      const fingerprint = generateSchemaFingerprintFromData(schema);

      expect(fingerprint.expectedColumns).toEqual([]);
      expect(fingerprint.columnTypes).toEqual({});
      expect(fingerprint.columnCount).toBe(0);
    });

    it('should preserve column type information', () => {
      const schema: InferredColumnSchema[] = [
        { columnName: 'id', detectedType: 'number', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
        { columnName: 'active', detectedType: 'boolean', distinctValuesCount: 2, emptyValuesRate: 0, sampleValues: [] },
        { columnName: 'date', detectedType: 'date', distinctValuesCount: 5, emptyValuesRate: 0, sampleValues: [] },
        { columnName: 'name', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
      ];

      const fingerprint = generateSchemaFingerprintFromData(schema);

      expect(fingerprint.columnTypes).toEqual({
        id: 'number',
        active: 'boolean',
        date: 'date',
        name: 'text',
      });
    });
  });

  describe('calculateConfigMatchScore', () => {
    it('should return 100% for perfect match', () => {
      const dataFingerprint = {
        expectedColumns: ['nom', 'prenom', 'email'],
        columnTypes: {
          nom: 'string',
          prenom: 'string',
          email: 'string',
        },
        columnCount: 3,
      };

      const storedConfig: StoredConfig = {
        name: 'Test Config',
        config: mockConfig,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        schemaFingerprint: {
          expectedColumns: ['nom', 'prenom', 'email'],
          columnTypes: {
            nom: 'string',
            prenom: 'string',
            email: 'string',
          },
          columnCount: 3,
        },
      };

      const result = calculateConfigMatchScore(dataFingerprint, storedConfig);

      expect(result.matchScore).toBe(100);
      expect(result.matchDetails.headerMatch).toBe(100);
      expect(result.matchDetails.typeMatch).toBe(100);
      expect(result.matchDetails.columnCountMatch).toBe(true);
      expect(result.config).toBe(storedConfig);
    });

    it('should return low score for no matching columns', () => {
      const dataFingerprint = {
        expectedColumns: ['col1', 'col2'],
        columnTypes: {
          col1: 'string',
          col2: 'string',
        },
        columnCount: 2,
      };

      const storedConfig: StoredConfig = {
        name: 'Test Config',
        config: mockConfig,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        schemaFingerprint: {
          expectedColumns: ['col3', 'col4'],
          columnTypes: {
            col3: 'string',
            col4: 'string',
          },
          columnCount: 2,
        },
      };

      const result = calculateConfigMatchScore(dataFingerprint, storedConfig);

      expect(result.matchDetails.headerMatch).toBe(0);
      expect(result.matchDetails.typeMatch).toBe(0);
      expect(result.matchDetails.columnCountMatch).toBe(true);

      // Final: 0*0.5 + 0*0.3 + 100*0.2 = 20
      expect(result.matchScore).toBe(20);
    });

    it('should return 0 for config without fingerprint', () => {
      const dataFingerprint = {
        expectedColumns: ['nom'],
        columnTypes: { nom: 'string' },
        columnCount: 1,
      };

      const storedConfig: StoredConfig = {
        name: 'Test Config',
        config: mockConfig,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        // No schemaFingerprint
      };

      const result = calculateConfigMatchScore(dataFingerprint, storedConfig);

      expect(result.matchScore).toBe(0);
      expect(result.config).toBeNull();
    });

    it('should calculate partial header match correctly', () => {
      const dataFingerprint = {
        expectedColumns: ['nom', 'prenom', 'age'],
        columnTypes: {
          nom: 'string',
          prenom: 'string',
          age: 'number',
        },
        columnCount: 3,
      };

      const storedConfig: StoredConfig = {
        name: 'Test Config',
        config: mockConfig,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        schemaFingerprint: {
          expectedColumns: ['nom', 'prenom', 'email', 'phone'],
          columnTypes: {
            nom: 'string',
            prenom: 'string',
            email: 'string',
            phone: 'string',
          },
          columnCount: 4,
        },
      };

      const result = calculateConfigMatchScore(dataFingerprint, storedConfig);

      // 2 matching headers out of 4 expected = 50%
      expect(result.matchDetails.headerMatch).toBe(50);

      // 2 matching types out of 2 matching headers = 100%
      expect(result.matchDetails.typeMatch).toBe(100);

      // Column count: 3 vs 4, diff = 1, score = 100 - 10 = 90
      expect(result.matchDetails.columnCountMatch).toBe(false);

      // Final: 50*0.5 + 100*0.3 + 90*0.2 = 25 + 30 + 18 = 73
      expect(result.matchScore).toBe(73);
    });

    it('should reduce score for type mismatches', () => {
      const dataFingerprint = {
        expectedColumns: ['id', 'name'],
        columnTypes: {
          id: 'number',
          name: 'string',
        },
        columnCount: 2,
      };

      const storedConfig: StoredConfig = {
        name: 'Test Config',
        config: mockConfig,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        schemaFingerprint: {
          expectedColumns: ['id', 'name'],
          columnTypes: {
            id: 'string', // Type mismatch
            name: 'string',
          },
          columnCount: 2,
        },
      };

      const result = calculateConfigMatchScore(dataFingerprint, storedConfig);

      // Headers match 100%
      expect(result.matchDetails.headerMatch).toBe(100);

      // Types: 1 match out of 2 = 50%
      expect(result.matchDetails.typeMatch).toBe(50);

      // Column count matches
      expect(result.matchDetails.columnCountMatch).toBe(true);

      // Final: 100*0.5 + 50*0.3 + 100*0.2 = 50 + 15 + 20 = 85
      expect(result.matchScore).toBe(85);
    });

    it('should penalize column count differences', () => {
      const dataFingerprint = {
        expectedColumns: ['col1', 'col2'],
        columnTypes: {
          col1: 'string',
          col2: 'string',
        },
        columnCount: 2,
      };

      const storedConfig: StoredConfig = {
        name: 'Test Config',
        config: mockConfig,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        schemaFingerprint: {
          expectedColumns: ['col1', 'col2'],
          columnTypes: {
            col1: 'string',
            col2: 'string',
          },
          columnCount: 5, // 3 columns difference
        },
      };

      const result = calculateConfigMatchScore(dataFingerprint, storedConfig);

      expect(result.matchDetails.columnCountMatch).toBe(false);

      // Column count score: 100 - 3*10 = 70
      // Final: 100*0.5 + 100*0.3 + 70*0.2 = 50 + 30 + 14 = 94
      expect(result.matchScore).toBe(94);
    });

    it('should handle large column count differences', () => {
      const dataFingerprint = {
        expectedColumns: ['col1'],
        columnTypes: { col1: 'string' },
        columnCount: 1,
      };

      const storedConfig: StoredConfig = {
        name: 'Test Config',
        config: mockConfig,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        schemaFingerprint: {
          expectedColumns: ['col1'],
          columnTypes: { col1: 'string' },
          columnCount: 20, // 19 columns difference, should give 0 score
        },
      };

      const result = calculateConfigMatchScore(dataFingerprint, storedConfig);

      // Column count score should be 0 (capped at minimum)
      // Final: 100*0.5 + 100*0.3 + 0*0.2 = 50 + 30 + 0 = 80
      expect(result.matchScore).toBe(80);
    });

    it('should use weighted scoring correctly (50/30/20)', () => {
      const dataFingerprint = {
        expectedColumns: ['a', 'b'],
        columnTypes: {
          a: 'string',
          b: 'string',
        },
        columnCount: 2,
      };

      const storedConfig: StoredConfig = {
        name: 'Test Config',
        config: mockConfig,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        schemaFingerprint: {
          expectedColumns: ['a', 'b', 'c', 'd'],
          columnTypes: {
            a: 'number', // Type mismatch
            b: 'string',
            c: 'string',
            d: 'string',
          },
          columnCount: 4,
        },
      };

      const result = calculateConfigMatchScore(dataFingerprint, storedConfig);

      // Header: 2/4 = 50%
      expect(result.matchDetails.headerMatch).toBe(50);

      // Type: 1/2 = 50%
      expect(result.matchDetails.typeMatch).toBe(50);

      // Column count: 2 vs 4, diff = 2, score = 100 - 20 = 80
      expect(result.matchDetails.columnCountMatch).toBe(false);

      // Final: 50*0.5 + 50*0.3 + 80*0.2 = 25 + 15 + 16 = 56
      expect(result.matchScore).toBe(56);
    });
  });

  describe('findBestMatchingConfig', () => {
    const schema: InferredColumnSchema[] = [
      { columnName: 'nom', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'prenom', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'age', detectedType: 'number', distinctValuesCount: 5, emptyValuesRate: 0, sampleValues: [] },
    ];

    it('should return null when no configs available', () => {
      const result = findBestMatchingConfig(schema, []);
      expect(result).toBeNull();
    });

    it('should return null when all scores below threshold', () => {
      const configs: StoredConfig[] = [
        {
          name: 'Config 1',
          config: mockConfig,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          schemaFingerprint: {
            expectedColumns: ['different', 'columns'],
            columnTypes: {
              different: 'string',
              columns: 'string',
            },
            columnCount: 2,
          },
        },
      ];

      const result = findBestMatchingConfig(schema, configs, 60);
      expect(result).toBeNull();
    });

    it('should return highest scoring config above threshold', () => {
      const configs: StoredConfig[] = [
        {
          name: 'Low Match',
          config: mockConfig,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          schemaFingerprint: {
            expectedColumns: ['nom', 'different'],
            columnTypes: {
              nom: 'text',
              different: 'text',
            },
            columnCount: 2,
          },
        },
        {
          name: 'Best Match',
          config: mockConfig,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          schemaFingerprint: {
            expectedColumns: ['nom', 'prenom', 'age'],
            columnTypes: {
              nom: 'text',
              prenom: 'text',
              age: 'number',
            },
            columnCount: 3,
          },
        },
        {
          name: 'Medium Match',
          config: mockConfig,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          schemaFingerprint: {
            expectedColumns: ['nom', 'prenom'],
            columnTypes: {
              nom: 'text',
              prenom: 'text',
            },
            columnCount: 2,
          },
        },
      ];

      const result = findBestMatchingConfig(schema, configs);

      expect(result).not.toBeNull();
      expect(result?.config?.name).toBe('Best Match');
      expect(result?.matchScore).toBe(100);
    });

    it('should respect custom minimum score threshold', () => {
      const configs: StoredConfig[] = [
        {
          name: 'Medium Match',
          config: mockConfig,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          schemaFingerprint: {
            expectedColumns: ['nom', 'prenom', 'age', 'extra'],
            columnTypes: {
              nom: 'string',
              prenom: 'string',
              age: 'number',
              extra: 'string',
            },
            columnCount: 4,
          },
        },
      ];

      // With default threshold (60%), should match
      const result1 = findBestMatchingConfig(schema, configs, 60);
      expect(result1).not.toBeNull();

      // With higher threshold (95%), should not match
      const result2 = findBestMatchingConfig(schema, configs, 95);
      expect(result2).toBeNull();
    });

    it('should skip configs without fingerprint', () => {
      const configs: StoredConfig[] = [
        {
          name: 'No Fingerprint',
          config: mockConfig,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          // No schemaFingerprint
        },
        {
          name: 'With Fingerprint',
          config: mockConfig,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          schemaFingerprint: {
            expectedColumns: ['nom', 'prenom', 'age'],
            columnTypes: {
              nom: 'string',
              prenom: 'string',
              age: 'number',
            },
            columnCount: 3,
          },
        },
      ];

      const result = findBestMatchingConfig(schema, configs);

      expect(result).not.toBeNull();
      expect(result?.config?.name).toBe('With Fingerprint');
    });
  });
});
