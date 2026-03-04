import type { InferredColumnSchema } from '../../types/core.types';
import type {
  ConfigSchemaFingerprint,
  ConfigMatchResult,
  StoredConfig,
} from '../../types/storage.types';
import { normalizeColumnName } from '../utils/string-utils';

/**
 * Générer une empreinte schématique depuis un schéma inféré
 * Utilisé pour comparer les données chargées avec les configs sauvegardées
 */
export function generateSchemaFingerprintFromData(
  schema: InferredColumnSchema[]
): ConfigSchemaFingerprint {
  const expectedColumns = schema.map((col) =>
    normalizeColumnName(col.columnName)
  );

  const columnTypes: Record<string, string> = {};
  for (const col of schema) {
    const normalizedName = normalizeColumnName(col.columnName);
    columnTypes[normalizedName] = col.detectedType;
  }

  return {
    expectedColumns,
    columnTypes,
    columnCount: expectedColumns.length,
  };
}

/**
 * Calculer le score de correspondance entre un schéma de données et une config stockée
 * Retourne un score de 0 à 100 basé sur :
 * - Header Match (50%) : pourcentage de colonnes qui correspondent
 * - Type Match (30%) : pourcentage de types qui correspondent
 * - Column Count Match (20%) : correspondance du nombre de colonnes
 */
export function calculateConfigMatchScore(
  dataFingerprint: ConfigSchemaFingerprint,
  storedConfig: StoredConfig
): ConfigMatchResult {
  const configFingerprint = storedConfig.schemaFingerprint;

  // Si la config n'a pas d'empreinte, on ne peut pas matcher
  if (!configFingerprint) {
    return {
      config: null,
      matchScore: 0,
      matchDetails: {
        headerMatch: 0,
        typeMatch: 0,
        columnCountMatch: false,
      },
    };
  }

  // 1. Calculer le header match (50% du score)
  const dataColumns = new Set(dataFingerprint.expectedColumns);
  const configColumns = new Set(configFingerprint.expectedColumns);

  let matchingHeaders = 0;
  for (const col of dataColumns) {
    if (configColumns.has(col)) {
      matchingHeaders++;
    }
  }

  const headerMatchPercent =
    configColumns.size > 0 ? (matchingHeaders / configColumns.size) * 100 : 0;

  // 2. Calculer le type match (30% du score)
  // Seulement pour les colonnes qui matchent
  let matchingTypes = 0;
  let typesToCheck = 0;

  for (const col of dataColumns) {
    if (configColumns.has(col)) {
      typesToCheck++;
      const dataType = dataFingerprint.columnTypes[col];
      const configType = configFingerprint.columnTypes[col];

      if (dataType === configType) {
        matchingTypes++;
      }
    }
  }

  const typeMatchPercent =
    typesToCheck > 0 ? (matchingTypes / typesToCheck) * 100 : 0;

  // 3. Calculer le column count match (20% du score)
  const columnCountMatch =
    dataFingerprint.columnCount === configFingerprint.columnCount;

  let columnCountScore = 0;
  if (columnCountMatch) {
    columnCountScore = 100;
  } else {
    // Pénalité de 10 points par colonne de différence
    const diff = Math.abs(
      dataFingerprint.columnCount - configFingerprint.columnCount
    );
    columnCountScore = Math.max(0, 100 - diff * 10);
  }

  // 4. Calculer le score final pondéré
  const finalScore =
    headerMatchPercent * 0.5 + typeMatchPercent * 0.3 + columnCountScore * 0.2;

  return {
    config: storedConfig,
    matchScore: Math.round(finalScore),
    matchDetails: {
      headerMatch: Math.round(headerMatchPercent),
      typeMatch: Math.round(typeMatchPercent),
      columnCountMatch,
    },
  };
}

/**
 * Trouver la meilleure config correspondant au schéma de données
 * Retourne null si aucune config n'atteint le seuil minimum (60% par défaut)
 */
export function findBestMatchingConfig(
  schema: InferredColumnSchema[],
  allConfigs: StoredConfig[],
  minScore = 60
): ConfigMatchResult | null {
  if (allConfigs.length === 0) {
    return null;
  }

  const dataFingerprint = generateSchemaFingerprintFromData(schema);

  let bestMatch: ConfigMatchResult | null = null;

  for (const storedConfig of allConfigs) {
    const matchResult = calculateConfigMatchScore(
      dataFingerprint,
      storedConfig
    );

    if (
      matchResult.matchScore >= minScore &&
      (!bestMatch || matchResult.matchScore > bestMatch.matchScore)
    ) {
      bestMatch = matchResult;
    }
  }

  return bestMatch;
}
