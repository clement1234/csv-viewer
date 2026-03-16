import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveConfig,
  loadConfig,
  loadAllConfigs,
  deleteConfig,
  renameConfig,
  getSelectedConfigName,
  setSelectedConfig,
  isFirstUse,
} from '../config-storage';
import type { Config } from '../../../types/config.types';

describe('config-storage', () => {
  const mockConfig: Config = {
    app: {
      title: 'Test App',
    },
    columns: {},
    filters: {},
    stats: { cards: [] },
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveConfig', () => {
    it('should save a new config with timestamps', () => {
      const beforeSave = new Date().toISOString();

      saveConfig('Test Config', mockConfig);

      const saved = loadConfig('Test Config');
      expect(saved).not.toBeNull();
      expect(saved?.name).toBe('Test Config');
      expect(saved?.config).toEqual(mockConfig);
      expect(saved?.createdAt).toBeDefined();
      expect(saved?.updatedAt).toBeDefined();

      if (saved) {
        const createdAt = new Date(saved.createdAt).getTime();
        const beforeTime = new Date(beforeSave).getTime();
        expect(createdAt).toBeGreaterThanOrEqual(beforeTime);
      }
    });

    it('should save config with fingerprint', () => {
      const fingerprint = {
        expectedColumns: ['nom', 'prenom'],
        columnTypes: { nom: 'string', prenom: 'string' },
        columnCount: 2,
      };

      saveConfig('Test Config', mockConfig, fingerprint);

      const saved = loadConfig('Test Config');
      expect(saved?.schemaFingerprint).toEqual(fingerprint);
    });

    it('should update existing config and preserve createdAt', async () => {
      saveConfig('Test Config', mockConfig);

      const firstSave = loadConfig('Test Config');
      const originalCreatedAt = firstSave?.createdAt;
      const originalUpdatedAt = firstSave?.updatedAt;

      // Wait 10ms to ensure different updatedAt timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedConfig: Config = {
        ...mockConfig,
        app: { title: 'Updated Title' },
      };

      saveConfig('Test Config', updatedConfig);

      const secondSave = loadConfig('Test Config');
      expect(secondSave?.createdAt).toBe(originalCreatedAt);
      expect(secondSave?.config.app?.title).toBe('Updated Title');

      // Verify updatedAt is later than original
      expect(secondSave).not.toBeNull();
      expect(originalUpdatedAt).toBeDefined();

      if (secondSave && originalUpdatedAt) {
        const updatedAtTime = new Date(secondSave.updatedAt).getTime();
        const originalTime = new Date(originalUpdatedAt).getTime();
        expect(updatedAtTime).toBeGreaterThan(originalTime);
      }
    });

    it('should add config name to list on first save', () => {
      saveConfig('Config 1', mockConfig);
      saveConfig('Config 2', mockConfig);

      const allConfigs = loadAllConfigs();
      expect(allConfigs).toHaveLength(2);
      expect(allConfigs.map((c) => c.name)).toEqual(['Config 1', 'Config 2']);
    });

    it('should not duplicate config name in list on update', () => {
      saveConfig('Test Config', mockConfig);
      saveConfig('Test Config', mockConfig);
      saveConfig('Test Config', mockConfig);

      const allConfigs = loadAllConfigs();
      expect(allConfigs).toHaveLength(1);
    });

    it('should throw error for empty config name', () => {
      expect(() => saveConfig('', mockConfig)).toThrow(
        'Le nom de la configuration ne peut pas être vide'
      );

      expect(() => saveConfig('   ', mockConfig)).toThrow(
        'Le nom de la configuration ne peut pas être vide'
      );
    });

    it('should throw error for invalid characters in name', () => {
      expect(() => saveConfig('Test:Config', mockConfig)).toThrow(
        'Le nom de la configuration ne peut pas contenir les caractères : / \\'
      );

      expect(() => saveConfig('Test/Config', mockConfig)).toThrow(
        'Le nom de la configuration ne peut pas contenir les caractères : / \\'
      );

      expect(() => saveConfig('Test\\Config', mockConfig)).toThrow(
        'Le nom de la configuration ne peut pas contenir les caractères : / \\'
      );
    });

    it('should handle localStorage quota exceeded', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      setItemSpy.mockImplementation(() => {
        throw quotaError;
      });

      expect(() => saveConfig('Test', mockConfig)).toThrow(
        'Quota localStorage dépassé'
      );

      setItemSpy.mockRestore();
    });
  });

  describe('loadConfig', () => {
    it('should load existing config', () => {
      saveConfig('Test Config', mockConfig);

      const loaded = loadConfig('Test Config');
      expect(loaded).not.toBeNull();
      expect(loaded?.name).toBe('Test Config');
      expect(loaded?.config).toEqual(mockConfig);
    });

    it('should return null for non-existent config', () => {
      const loaded = loadConfig('Non-Existent');
      expect(loaded).toBeNull();
    });

    it('should return null for corrupted config data', () => {
      localStorage.setItem('csv-viewer:config:Corrupted', 'not valid JSON');

      const loaded = loadConfig('Corrupted');
      expect(loaded).toBeNull();
    });

    it('should return null for invalid config structure', () => {
      localStorage.setItem(
        'csv-viewer:config:Invalid',
        JSON.stringify({ invalid: 'structure' })
      );

      const loaded = loadConfig('Invalid');
      expect(loaded).toBeNull();
    });
  });

  describe('loadAllConfigs', () => {
    it('should load all saved configs', () => {
      saveConfig('Config 1', mockConfig);
      saveConfig('Config 2', {
        ...mockConfig,
        app: { title: 'Config 2' },
      });
      saveConfig('Config 3', {
        ...mockConfig,
        app: { title: 'Config 3' },
      });

      const allConfigs = loadAllConfigs();
      expect(allConfigs).toHaveLength(3);
      expect(allConfigs[0].name).toBe('Config 1');
      expect(allConfigs[1].name).toBe('Config 2');
      expect(allConfigs[2].name).toBe('Config 3');
    });

    it('should return empty array when no configs exist', () => {
      const allConfigs = loadAllConfigs();
      expect(allConfigs).toEqual([]);
    });

    it('should skip corrupted configs', () => {
      saveConfig('Valid Config', mockConfig);

      localStorage.setItem('csv-viewer:config:Corrupted', 'not valid JSON');

      const list = JSON.parse(
        localStorage.getItem('csv-viewer:config-list') || '[]'
      );
      list.push('Corrupted');
      localStorage.setItem('csv-viewer:config-list', JSON.stringify(list));

      const allConfigs = loadAllConfigs();
      expect(allConfigs).toHaveLength(1);
      expect(allConfigs[0].name).toBe('Valid Config');
    });

    it('should handle corrupted config list', () => {
      saveConfig('Config 1', mockConfig);

      localStorage.setItem('csv-viewer:config-list', 'not valid JSON');

      const allConfigs = loadAllConfigs();
      expect(allConfigs).toEqual([]);
    });

    it('should handle non-array config list', () => {
      saveConfig('Config 1', mockConfig);

      localStorage.setItem(
        'csv-viewer:config-list',
        JSON.stringify({ invalid: 'structure' })
      );

      const allConfigs = loadAllConfigs();
      expect(allConfigs).toEqual([]);
    });
  });

  describe('deleteConfig', () => {
    it('should delete config and remove from list', () => {
      saveConfig('Config 1', mockConfig);
      saveConfig('Config 2', mockConfig);

      deleteConfig('Config 1');

      expect(loadConfig('Config 1')).toBeNull();

      const allConfigs = loadAllConfigs();
      expect(allConfigs).toHaveLength(1);
      expect(allConfigs[0].name).toBe('Config 2');
    });

    it('should clear selected config if deleted', () => {
      saveConfig('Test Config', mockConfig);
      setSelectedConfig('Test Config');

      expect(getSelectedConfigName()).toBe('Test Config');

      deleteConfig('Test Config');

      expect(getSelectedConfigName()).toBeNull();
    });

    it('should not affect selected config if different config deleted', () => {
      saveConfig('Config 1', mockConfig);
      saveConfig('Config 2', mockConfig);
      setSelectedConfig('Config 1');

      deleteConfig('Config 2');

      expect(getSelectedConfigName()).toBe('Config 1');
    });

    it('should handle deleting non-existent config gracefully', () => {
      expect(() => deleteConfig('Non-Existent')).not.toThrow();
    });
  });

  describe('renameConfig', () => {
    it('should rename config and update list', () => {
      saveConfig('Old Name', mockConfig);

      renameConfig('Old Name', 'New Name');

      expect(loadConfig('Old Name')).toBeNull();

      const renamed = loadConfig('New Name');
      expect(renamed).not.toBeNull();
      expect(renamed?.config).toEqual(mockConfig);

      const allConfigs = loadAllConfigs();
      expect(allConfigs).toHaveLength(1);
      expect(allConfigs[0].name).toBe('New Name');
    });

    it('should update selected config if renamed', () => {
      saveConfig('Old Name', mockConfig);
      setSelectedConfig('Old Name');

      renameConfig('Old Name', 'New Name');

      expect(getSelectedConfigName()).toBe('New Name');
    });

    it('should preserve fingerprint when renaming', () => {
      const fingerprint = {
        expectedColumns: ['col1'],
        columnTypes: { col1: 'string' },
        columnCount: 1,
      };

      saveConfig('Old Name', mockConfig, fingerprint);

      renameConfig('Old Name', 'New Name');

      const renamed = loadConfig('New Name');
      expect(renamed?.schemaFingerprint).toEqual(fingerprint);
    });

    it('should throw error if old config does not exist', () => {
      expect(() => renameConfig('Non-Existent', 'New Name')).toThrow(
        'La configuration "Non-Existent" n\'existe pas'
      );
    });

    it('should throw error if new name already exists', () => {
      saveConfig('Config 1', mockConfig);
      saveConfig('Config 2', mockConfig);

      expect(() => renameConfig('Config 1', 'Config 2')).toThrow(
        'Une configuration nommée "Config 2" existe déjà'
      );
    });

    it('should throw error for invalid new name', () => {
      saveConfig('Old Name', mockConfig);

      expect(() => renameConfig('Old Name', '')).toThrow(
        'Le nom de la configuration ne peut pas être vide'
      );

      expect(() => renameConfig('Old Name', 'Test:Name')).toThrow(
        'Le nom de la configuration ne peut pas contenir les caractères : / \\'
      );
    });
  });

  describe('getSelectedConfigName', () => {
    it('should return null when no config is selected', () => {
      expect(getSelectedConfigName()).toBeNull();
    });

    it('should return selected config name', () => {
      setSelectedConfig('Test Config');
      expect(getSelectedConfigName()).toBe('Test Config');
    });
  });

  describe('setSelectedConfig', () => {
    it('should set selected config name', () => {
      setSelectedConfig('Test Config');
      expect(getSelectedConfigName()).toBe('Test Config');
    });

    it('should overwrite previous selection', () => {
      setSelectedConfig('Config 1');
      setSelectedConfig('Config 2');

      expect(getSelectedConfigName()).toBe('Config 2');
    });

    it('should handle localStorage quota exceeded', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      setItemSpy.mockImplementation(() => {
        throw quotaError;
      });

      expect(() => setSelectedConfig('Test')).toThrow(
        'Quota localStorage dépassé'
      );

      setItemSpy.mockRestore();
    });
  });

  describe('isFirstUse', () => {
    it('should return true when no storage version exists', () => {
      expect(isFirstUse()).toBe(true);
    });

    it('should return false after first save', () => {
      saveConfig('Test Config', mockConfig);
      expect(isFirstUse()).toBe(false);
    });

    it('should return true for corrupted storage version', () => {
      localStorage.setItem('csv-viewer:storage-version', 'not valid JSON');
      expect(isFirstUse()).toBe(true);
    });

    it('should return true for invalid storage version structure', () => {
      localStorage.setItem(
        'csv-viewer:storage-version',
        JSON.stringify({ invalid: 'structure' })
      );
      expect(isFirstUse()).toBe(true);
    });
  });
});
