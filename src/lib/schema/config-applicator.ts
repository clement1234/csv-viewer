import type { Config } from '../../types/config.types.ts';
import type { DataRow, InferredColumnSchema } from '../../types/core.types.ts';
import { generateDefaultConfigFromSchema } from './schema-inference.ts';

interface ApplyConfigResult {
  appliedConfig: Config;
  warnings: string[];
  normalizedData: DataRow[];
}

export function applyColumnAliasesToDataRows(
  data: DataRow[],
  aliases: Record<string, string>,
): DataRow[] {
  return data.map((row) => {
    const newRow: DataRow = {};
    for (const [key, value] of Object.entries(row)) {
      const newKey = aliases[key] ?? key;
      newRow[newKey] = value;
    }
    return newRow;
  });
}

function checkExpectedHeaders(
  config: Config,
  schema: InferredColumnSchema[],
): { warnings: string[]; shouldThrow: boolean } {
  const warnings: string[] = [];
  const matchConfig = config.match;

  if (!matchConfig?.expectedHeaders || matchConfig.expectedHeaders.length === 0) {
    return { warnings, shouldThrow: false };
  }

  const existingColumns = new Set(schema.map((col) => col.columnName));
  const missingHeaders = matchConfig.expectedHeaders.filter(
    (header) => !existingColumns.has(header),
  );

  if (missingHeaders.length === 0) return { warnings, shouldThrow: false };

  const missingRate = missingHeaders.length / matchConfig.expectedHeaders.length;
  const message = `Colonnes manquantes (${missingHeaders.length}/${matchConfig.expectedHeaders.length}) : ${missingHeaders.join(', ')}`;
  warnings.push(message);

  if (missingRate >= 0.5 && matchConfig.strictMode) {
    return { warnings, shouldThrow: true };
  }

  return { warnings, shouldThrow: false };
}

function deepMergeConfig(autoConfig: Partial<Config>, userConfig: Config): Config {
  const merged: Config = { ...autoConfig };

  for (const [key, userValue] of Object.entries(userConfig)) {
    const configKey = key as keyof Config;
    if (userValue === undefined) continue;

    const autoValue = merged[configKey];
    if (autoValue && typeof autoValue === 'object' && typeof userValue === 'object') {
      (merged as Record<string, unknown>)[configKey] = { ...autoValue, ...userValue };
    } else {
      (merged as Record<string, unknown>)[configKey] = userValue;
    }
  }

  return merged;
}

export function applyConfigToSchemaAndData(
  config: Config,
  schema: InferredColumnSchema[],
  data: DataRow[],
): ApplyConfigResult {
  const { warnings, shouldThrow } = checkExpectedHeaders(config, schema);

  if (shouldThrow) {
    throw new Error(
      `Trop de colonnes manquantes en mode strict. ${warnings[0]}`,
    );
  }

  // Appliquer les aliases
  let normalizedData = data;
  if (config.columns?.aliases && Object.keys(config.columns.aliases).length > 0) {
    normalizedData = applyColumnAliasesToDataRows(data, config.columns.aliases);
  }

  // Générer config auto et merger avec config utilisateur (priorité utilisateur)
  const autoConfig = generateDefaultConfigFromSchema(schema);
  const appliedConfig = deepMergeConfig(autoConfig, config);

  return { appliedConfig, warnings, normalizedData };
}
