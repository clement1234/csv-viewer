import { useCallback } from 'react';
import type { Config } from '../types/config.types';
import type {
  ConfigSchemaFingerprint,
  StoredConfig,
  ConfigMatchResult,
} from '../types/storage.types';
import type { InferredColumnSchema } from '../types/core.types';
import {
  saveConfig as saveConfigToStorage,
  loadConfig as loadConfigFromStorage,
  loadAllConfigs as loadAllConfigsFromStorage,
  deleteConfig as deleteConfigFromStorage,
  renameConfig as renameConfigInStorage,
  getSelectedConfigName as getSelectedConfigNameFromStorage,
  setSelectedConfig as setSelectedConfigInStorage,
  isFirstUse as checkIsFirstUse,
} from '../lib/storage/config-storage';
import { findBestMatchingConfig } from '../lib/storage/config-matcher';

/**
 * Hook React pour gérer le stockage et la récupération des configurations
 * Fournit une interface pour interagir avec localStorage via les services de storage
 */
export function useConfigStorage(): {
  saveConfig: (
    name: string,
    config: Config,
    fingerprint?: ConfigSchemaFingerprint
  ) => void;
  loadConfig: (name: string) => StoredConfig | null;
  loadAllConfigs: () => StoredConfig[];
  deleteConfig: (name: string) => void;
  renameConfig: (oldName: string, newName: string) => void;
  getSelectedConfigName: () => string | null;
  setSelectedConfig: (name: string) => void;
  isFirstUse: () => boolean;
  findBestMatch: (
    schema: InferredColumnSchema[],
    minScore?: number
  ) => ConfigMatchResult | null;
} {
  const saveConfig = useCallback(
    (
      name: string,
      config: Config,
      fingerprint?: ConfigSchemaFingerprint
    ): void => {
      saveConfigToStorage(name, config, fingerprint);
    },
    []
  );

  const loadConfig = useCallback((name: string): StoredConfig | null => {
    return loadConfigFromStorage(name);
  }, []);

  const loadAllConfigs = useCallback((): StoredConfig[] => {
    return loadAllConfigsFromStorage();
  }, []);

  const deleteConfig = useCallback((name: string): void => {
    deleteConfigFromStorage(name);
  }, []);

  const renameConfig = useCallback((oldName: string, newName: string): void => {
    renameConfigInStorage(oldName, newName);
  }, []);

  const getSelectedConfigName = useCallback((): string | null => {
    return getSelectedConfigNameFromStorage();
  }, []);

  const setSelectedConfig = useCallback((name: string): void => {
    setSelectedConfigInStorage(name);
  }, []);

  const isFirstUse = useCallback((): boolean => {
    return checkIsFirstUse();
  }, []);

  const findBestMatch = useCallback(
    (
      schema: InferredColumnSchema[],
      minScore?: number
    ): ConfigMatchResult | null => {
      const allConfigs = loadAllConfigsFromStorage();
      return findBestMatchingConfig(schema, allConfigs, minScore);
    },
    []
  );

  return {
    saveConfig,
    loadConfig,
    loadAllConfigs,
    deleteConfig,
    renameConfig,
    getSelectedConfigName,
    setSelectedConfig,
    isFirstUse,
    findBestMatch,
  };
}
