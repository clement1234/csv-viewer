import type { Config } from '../../types/config.types';
import type {
  StoredConfig,
  ConfigSchemaFingerprint,
  StorageVersion,
} from '../../types/storage.types';
import { isStoredConfig, isStorageVersion } from '../../types/storage.types';

const STORAGE_PREFIX = 'csv-viewer:';
const STORAGE_KEYS = {
  CONFIG_LIST: `${STORAGE_PREFIX}config-list`,
  CONFIG: (name: string) => `${STORAGE_PREFIX}config:${name}`,
  SELECTED_CONFIG: `${STORAGE_PREFIX}selected-config`,
  STORAGE_VERSION: `${STORAGE_PREFIX}storage-version`,
} as const;

const CURRENT_STORAGE_VERSION = 1;

/**
 * Valider le nom d'une configuration
 * Empêche les noms vides et les caractères spéciaux problématiques
 */
function validateConfigName(name: string): void {
  if (!name || name.trim() === '') {
    throw new Error('Le nom de la configuration ne peut pas être vide');
  }

  if (name.includes(':') || name.includes('/') || name.includes('\\')) {
    throw new Error(
      'Le nom de la configuration ne peut pas contenir les caractères : / \\'
    );
  }
}

/**
 * Initialiser le système de storage si première utilisation
 */
function initializeStorage(): void {
  try {
    const versionData = localStorage.getItem(STORAGE_KEYS.STORAGE_VERSION);

    if (!versionData) {
      const version: StorageVersion = { version: CURRENT_STORAGE_VERSION };
      localStorage.setItem(
        STORAGE_KEYS.STORAGE_VERSION,
        JSON.stringify(version)
      );

      localStorage.setItem(STORAGE_KEYS.CONFIG_LIST, JSON.stringify([]));
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error(
        'Quota localStorage dépassé. Supprimez des configurations pour libérer de l\'espace.'
      );
    }
    throw error;
  }
}

/**
 * Charger la liste des noms de configurations
 */
function loadConfigList(): string[] {
  try {
    const listData = localStorage.getItem(STORAGE_KEYS.CONFIG_LIST);

    if (!listData) {
      return [];
    }

    const parsed: unknown = JSON.parse(listData);

    if (
      !Array.isArray(parsed) ||
      !parsed.every((item) => typeof item === 'string')
    ) {
      console.error('Liste de configurations corrompue, réinitialisation');
      return [];
    }

    return parsed;
  } catch (error) {
    console.error('Erreur lors du chargement de la liste de configurations', error);
    return [];
  }
}

/**
 * Sauvegarder la liste des noms de configurations
 */
function saveConfigList(list: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG_LIST, JSON.stringify(list));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error(
        'Quota localStorage dépassé. Supprimez des configurations pour libérer de l\'espace.'
      );
    }
    throw error;
  }
}

/**
 * Sauvegarder ou mettre à jour une configuration
 * Si la config existe déjà, préserve la date de création et met à jour la date de modification
 */
export function saveConfig(
  name: string,
  config: Config,
  fingerprint?: ConfigSchemaFingerprint
): void {
  validateConfigName(name);
  initializeStorage();

  const now = new Date().toISOString();
  const existingConfig = loadConfig(name);

  const storedConfig: StoredConfig = {
    name,
    config,
    createdAt: existingConfig?.createdAt ?? now,
    updatedAt: now,
    schemaFingerprint: fingerprint,
  };

  try {
    localStorage.setItem(
      STORAGE_KEYS.CONFIG(name),
      JSON.stringify(storedConfig)
    );

    const configList = loadConfigList();
    if (!configList.includes(name)) {
      configList.push(name);
      saveConfigList(configList);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error(
        'Quota localStorage dépassé. Supprimez des configurations pour libérer de l\'espace.'
      );
    }
    throw error;
  }
}

/**
 * Charger une configuration par son nom
 * Retourne null si la configuration n'existe pas ou est invalide
 */
export function loadConfig(name: string): StoredConfig | null {
  try {
    const configData = localStorage.getItem(STORAGE_KEYS.CONFIG(name));

    if (!configData) {
      return null;
    }

    const parsed: unknown = JSON.parse(configData);

    if (!isStoredConfig(parsed)) {
      console.error(`Configuration "${name}" invalide dans localStorage`);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(`Erreur lors du chargement de la configuration "${name}"`, error);
    return null;
  }
}

/**
 * Charger toutes les configurations sauvegardées
 * Ignore les configurations invalides ou corrompues
 */
export function loadAllConfigs(): StoredConfig[] {
  initializeStorage();

  const configList = loadConfigList();
  const configs: StoredConfig[] = [];

  for (const name of configList) {
    const config = loadConfig(name);
    if (config) {
      configs.push(config);
    }
  }

  return configs;
}

/**
 * Supprimer une configuration
 * Met à jour la liste des configurations et supprime la sélection si nécessaire
 */
export function deleteConfig(name: string): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONFIG(name));

    const configList = loadConfigList();
    const updatedList = configList.filter((configName) => configName !== name);
    saveConfigList(updatedList);

    const selectedConfig = getSelectedConfigName();
    if (selectedConfig === name) {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_CONFIG);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de la configuration "${name}"`, error);
    throw error;
  }
}

/**
 * Renommer une configuration
 * Met à jour la liste et la sélection si nécessaire
 */
export function renameConfig(oldName: string, newName: string): void {
  validateConfigName(newName);

  const existingConfig = loadConfig(oldName);
  if (!existingConfig) {
    throw new Error(`La configuration "${oldName}" n'existe pas`);
  }

  const newConfigExists = loadConfig(newName);
  if (newConfigExists) {
    throw new Error(`Une configuration nommée "${newName}" existe déjà`);
  }

  try {
    // Check if we need to update selection BEFORE deleting
    const selectedConfig = getSelectedConfigName();
    const shouldUpdateSelection = selectedConfig === oldName;

    saveConfig(newName, existingConfig.config, existingConfig.schemaFingerprint);

    deleteConfig(oldName);

    if (shouldUpdateSelection) {
      setSelectedConfig(newName);
    }
  } catch (error) {
    console.error(`Erreur lors du renommage de "${oldName}" en "${newName}"`, error);
    throw error;
  }
}

/**
 * Obtenir le nom de la configuration actuellement sélectionnée
 * Retourne null si aucune configuration n'est sélectionnée
 */
export function getSelectedConfigName(): string | null {
  try {
    const selected = localStorage.getItem(STORAGE_KEYS.SELECTED_CONFIG);
    return selected;
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration sélectionnée', error);
    return null;
  }
}

/**
 * Définir la configuration actuellement sélectionnée
 */
export function setSelectedConfig(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CONFIG, name);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error(
        'Quota localStorage dépassé. Supprimez des configurations pour libérer de l\'espace.'
      );
    }
    throw error;
  }
}

/**
 * Vérifier si c'est la première utilisation de l'application
 * (pas de version de storage enregistrée)
 */
export function isFirstUse(): boolean {
  try {
    const versionData = localStorage.getItem(STORAGE_KEYS.STORAGE_VERSION);

    if (!versionData) {
      return true;
    }

    const parsed: unknown = JSON.parse(versionData);

    if (!isStorageVersion(parsed)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification de la première utilisation', error);
    return true;
  }
}
