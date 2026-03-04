import type { Config } from './config.types';

/**
 * Configuration stockée dans localStorage avec métadonnées
 */
export interface StoredConfig {
  name: string;
  config: Config;
  createdAt: string;
  updatedAt: string;
  schemaFingerprint?: ConfigSchemaFingerprint;
}

/**
 * Empreinte schématique d'une config pour l'auto-détection
 */
export interface ConfigSchemaFingerprint {
  expectedColumns: string[];
  columnTypes: Record<string, string>;
  columnCount: number;
}

/**
 * Résultat du matching entre données et config
 */
export interface ConfigMatchResult {
  config: StoredConfig | null;
  matchScore: number;
  matchDetails: {
    headerMatch: number;
    typeMatch: number;
    columnCountMatch: boolean;
  };
}

/**
 * Version du système de storage pour migrations futures
 */
export interface StorageVersion {
  version: number;
}

/**
 * Type guard pour vérifier qu'un objet est un StoredConfig valide
 */
export function isStoredConfig(value: unknown): value is StoredConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    typeof candidate.config === 'object' &&
    candidate.config !== null
  );
}

/**
 * Type guard pour vérifier qu'un objet est un ConfigSchemaFingerprint valide
 */
export function isConfigSchemaFingerprint(
  value: unknown
): value is ConfigSchemaFingerprint {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    Array.isArray(candidate.expectedColumns) &&
    candidate.expectedColumns.every((col) => typeof col === 'string') &&
    typeof candidate.columnTypes === 'object' &&
    candidate.columnTypes !== null &&
    typeof candidate.columnCount === 'number'
  );
}

/**
 * Type guard pour vérifier qu'un objet est un StorageVersion valide
 */
export function isStorageVersion(value: unknown): value is StorageVersion {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.version === 'number';
}
