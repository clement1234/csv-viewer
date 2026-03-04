import { describe, it, expect } from 'vitest';
import {
  isStoredConfig,
  isConfigSchemaFingerprint,
  isStorageVersion,
  type StoredConfig,
  type ConfigSchemaFingerprint,
  type StorageVersion,
} from '../storage.types';

describe('storage.types', () => {
  describe('isStoredConfig', () => {
    it('should return true for valid StoredConfig', () => {
      const validConfig: StoredConfig = {
        name: 'Test Config',
        config: {
          app: { title: 'Test' },
          columns: {},
          filters: {},
          stats: { cards: [] },
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(isStoredConfig(validConfig)).toBe(true);
    });

    it('should return true for StoredConfig with schemaFingerprint', () => {
      const validConfig: StoredConfig = {
        name: 'Test Config',
        config: {
          app: { title: 'Test' },
          columns: {},
          filters: {},
          stats: { cards: [] },
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        schemaFingerprint: {
          expectedColumns: ['col1', 'col2'],
          columnTypes: { col1: 'string', col2: 'number' },
          columnCount: 2,
        },
      };

      expect(isStoredConfig(validConfig)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isStoredConfig(null)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isStoredConfig('string')).toBe(false);
      expect(isStoredConfig(123)).toBe(false);
      expect(isStoredConfig(true)).toBe(false);
    });

    it('should return false for missing name', () => {
      const invalid = {
        config: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(isStoredConfig(invalid)).toBe(false);
    });

    it('should return false for missing config', () => {
      const invalid = {
        name: 'Test',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(isStoredConfig(invalid)).toBe(false);
    });

    it('should return false for null config', () => {
      const invalid = {
        name: 'Test',
        config: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(isStoredConfig(invalid)).toBe(false);
    });

    it('should return false for missing timestamps', () => {
      const invalid = {
        name: 'Test',
        config: {},
      };

      expect(isStoredConfig(invalid)).toBe(false);
    });

    it('should return false for invalid timestamp types', () => {
      const invalid = {
        name: 'Test',
        config: {},
        createdAt: 123,
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(isStoredConfig(invalid)).toBe(false);
    });
  });

  describe('isConfigSchemaFingerprint', () => {
    it('should return true for valid ConfigSchemaFingerprint', () => {
      const validFingerprint: ConfigSchemaFingerprint = {
        expectedColumns: ['nom', 'prenom', 'email'],
        columnTypes: {
          nom: 'string',
          prenom: 'string',
          email: 'string',
        },
        columnCount: 3,
      };

      expect(isConfigSchemaFingerprint(validFingerprint)).toBe(true);
    });

    it('should return true for empty expectedColumns', () => {
      const validFingerprint: ConfigSchemaFingerprint = {
        expectedColumns: [],
        columnTypes: {},
        columnCount: 0,
      };

      expect(isConfigSchemaFingerprint(validFingerprint)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isConfigSchemaFingerprint(null)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isConfigSchemaFingerprint('string')).toBe(false);
      expect(isConfigSchemaFingerprint([])).toBe(false);
    });

    it('should return false for missing expectedColumns', () => {
      const invalid = {
        columnTypes: {},
        columnCount: 0,
      };

      expect(isConfigSchemaFingerprint(invalid)).toBe(false);
    });

    it('should return false for non-array expectedColumns', () => {
      const invalid = {
        expectedColumns: 'not an array',
        columnTypes: {},
        columnCount: 0,
      };

      expect(isConfigSchemaFingerprint(invalid)).toBe(false);
    });

    it('should return false for expectedColumns with non-string elements', () => {
      const invalid = {
        expectedColumns: ['col1', 123, 'col3'],
        columnTypes: {},
        columnCount: 3,
      };

      expect(isConfigSchemaFingerprint(invalid)).toBe(false);
    });

    it('should return false for missing columnTypes', () => {
      const invalid = {
        expectedColumns: [],
        columnCount: 0,
      };

      expect(isConfigSchemaFingerprint(invalid)).toBe(false);
    });

    it('should return false for null columnTypes', () => {
      const invalid = {
        expectedColumns: [],
        columnTypes: null,
        columnCount: 0,
      };

      expect(isConfigSchemaFingerprint(invalid)).toBe(false);
    });

    it('should return false for missing columnCount', () => {
      const invalid = {
        expectedColumns: [],
        columnTypes: {},
      };

      expect(isConfigSchemaFingerprint(invalid)).toBe(false);
    });

    it('should return false for non-number columnCount', () => {
      const invalid = {
        expectedColumns: [],
        columnTypes: {},
        columnCount: '3',
      };

      expect(isConfigSchemaFingerprint(invalid)).toBe(false);
    });
  });

  describe('isStorageVersion', () => {
    it('should return true for valid StorageVersion', () => {
      const validVersion: StorageVersion = {
        version: 1,
      };

      expect(isStorageVersion(validVersion)).toBe(true);
    });

    it('should return true for version 0', () => {
      const validVersion: StorageVersion = {
        version: 0,
      };

      expect(isStorageVersion(validVersion)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isStorageVersion(null)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isStorageVersion(1)).toBe(false);
      expect(isStorageVersion('version')).toBe(false);
    });

    it('should return false for missing version', () => {
      const invalid = {};

      expect(isStorageVersion(invalid)).toBe(false);
    });

    it('should return false for non-number version', () => {
      const invalid = {
        version: '1',
      };

      expect(isStorageVersion(invalid)).toBe(false);
    });
  });
});
