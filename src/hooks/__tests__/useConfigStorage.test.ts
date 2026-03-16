import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useConfigStorage } from '../useConfigStorage';
import type { Config } from '../../types/config.types';
import type { InferredColumnSchema } from '../../types/core.types';

describe('useConfigStorage', () => {
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
  });

  it('should initialize correctly', () => {
    const { result } = renderHook(() => useConfigStorage());

    expect(result.current.saveConfig).toBeDefined();
    expect(result.current.loadConfig).toBeDefined();
    expect(result.current.loadAllConfigs).toBeDefined();
    expect(result.current.deleteConfig).toBeDefined();
    expect(result.current.renameConfig).toBeDefined();
    expect(result.current.getSelectedConfigName).toBeDefined();
    expect(result.current.setSelectedConfig).toBeDefined();
    expect(result.current.isFirstUse).toBeDefined();
    expect(result.current.findBestMatch).toBeDefined();
  });

  it('should save and load config', () => {
    const { result } = renderHook(() => useConfigStorage());

    result.current.saveConfig('Test Config', mockConfig);

    const loaded = result.current.loadConfig('Test Config');
    expect(loaded).not.toBeNull();
    expect(loaded?.name).toBe('Test Config');
    expect(loaded?.config).toEqual(mockConfig);
  });

  it('should save config with fingerprint', () => {
    const { result } = renderHook(() => useConfigStorage());

    const fingerprint = {
      expectedColumns: ['nom'],
      columnTypes: { nom: 'string' },
      columnCount: 1,
    };

    result.current.saveConfig('Test Config', mockConfig, fingerprint);

    const loaded = result.current.loadConfig('Test Config');
    expect(loaded?.schemaFingerprint).toEqual(fingerprint);
  });

  it('should load all configs', () => {
    const { result } = renderHook(() => useConfigStorage());

    result.current.saveConfig('Config 1', mockConfig);
    result.current.saveConfig('Config 2', {
      ...mockConfig,
      appBranding: { title: 'Config 2' },
    });

    const allConfigs = result.current.loadAllConfigs();
    expect(allConfigs).toHaveLength(2);
    expect(allConfigs.map((c) => c.name)).toEqual(['Config 1', 'Config 2']);
  });

  it('should delete config', () => {
    const { result } = renderHook(() => useConfigStorage());

    result.current.saveConfig('Test Config', mockConfig);
    expect(result.current.loadConfig('Test Config')).not.toBeNull();

    result.current.deleteConfig('Test Config');
    expect(result.current.loadConfig('Test Config')).toBeNull();
  });

  it('should rename config', () => {
    const { result } = renderHook(() => useConfigStorage());

    result.current.saveConfig('Old Name', mockConfig);

    result.current.renameConfig('Old Name', 'New Name');

    expect(result.current.loadConfig('Old Name')).toBeNull();
    expect(result.current.loadConfig('New Name')).not.toBeNull();
  });

  it('should get and set selected config', () => {
    const { result } = renderHook(() => useConfigStorage());

    expect(result.current.getSelectedConfigName()).toBeNull();

    result.current.setSelectedConfig('Test Config');

    expect(result.current.getSelectedConfigName()).toBe('Test Config');
  });

  it('should check if first use', () => {
    const { result } = renderHook(() => useConfigStorage());

    expect(result.current.isFirstUse()).toBe(true);

    result.current.saveConfig('Test Config', mockConfig);

    expect(result.current.isFirstUse()).toBe(false);
  });

  it('should find best matching config', () => {
    const { result } = renderHook(() => useConfigStorage());

    const fingerprint1 = {
      expectedColumns: ['different', 'columns'],
      columnTypes: { different: 'string', columns: 'string' },
      columnCount: 2,
    };

    const fingerprint2 = {
      expectedColumns: ['nom', 'prenom'],
      columnTypes: { nom: 'text', prenom: 'text' },
      columnCount: 2,
    };

    result.current.saveConfig('Low Match', mockConfig, fingerprint1);
    result.current.saveConfig('Best Match', mockConfig, fingerprint2);

    const schema: InferredColumnSchema[] = [
      { columnName: 'nom', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'prenom', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
    ];

    const bestMatch = result.current.findBestMatch(schema);

    expect(bestMatch).not.toBeNull();
    expect(bestMatch?.config?.name).toBe('Best Match');
    expect(bestMatch?.matchScore).toBe(100);
  });

  it('should return null for no matching configs', () => {
    const { result } = renderHook(() => useConfigStorage());

    const schema: InferredColumnSchema[] = [
      { columnName: 'unknown_column', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
    ];

    const bestMatch = result.current.findBestMatch(schema);

    expect(bestMatch).toBeNull();
  });

  it('should respect custom threshold in findBestMatch', () => {
    const { result } = renderHook(() => useConfigStorage());

    const fingerprint = {
      expectedColumns: ['nom', 'prenom', 'age', 'email'],
      columnTypes: {
        nom: 'text',
        prenom: 'text',
        age: 'number',
        email: 'text',
      },
      columnCount: 4,
    };

    result.current.saveConfig('Partial Match', mockConfig, fingerprint);

    const schema: InferredColumnSchema[] = [
      { columnName: 'nom', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
      { columnName: 'prenom', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: [] },
    ];

    // With default threshold (60%), should match
    const match1 = result.current.findBestMatch(schema);
    expect(match1).not.toBeNull();

    // With high threshold (95%), should not match
    const match2 = result.current.findBestMatch(schema, 95);
    expect(match2).toBeNull();
  });
});
