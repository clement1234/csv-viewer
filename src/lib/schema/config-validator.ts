import type { Config } from '../../types/config.types.ts';

interface ValidationResult {
  isValid: boolean;
  config?: Config;
  errors?: string[];
}

const VALID_TOP_LEVEL_KEYS = new Set([
  'app', 'csv', 'match', 'columns', 'filters', 'stats', 'detailModal',
]);

const VALID_DATE_FORMATS = new Set(['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']);
const VALID_BADGE_VARIANTS = new Set(['solid', 'outline', 'subtle']);
const VALID_LINK_TYPES = new Set(['mailto', 'tel', 'url']);
const VALID_FORMAT_TYPES = new Set(['date', 'badge', 'splitBadges', 'link']);
const VALID_COMPUTED_DATE_FORMATS = new Set(['excel', 'YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function validateAppConfig(value: unknown, errors: string[]): boolean {
  if (!isRecord(value)) {
    errors.push('La section "app" doit être un objet.');
    return false;
  }
  if (value.title !== undefined && typeof value.title !== 'string') {
    errors.push('app.title doit être une chaîne de caractères.');
    return false;
  }
  if (value.subtitle !== undefined && typeof value.subtitle !== 'string') {
    errors.push('app.subtitle doit être une chaîne de caractères.');
    return false;
  }
  return true;
}

function validateCSVConfig(value: unknown, errors: string[]): boolean {
  if (!isRecord(value)) {
    errors.push('La section "csv" doit être un objet.');
    return false;
  }
  if (value.delimiter !== undefined && typeof value.delimiter !== 'string') {
    errors.push('csv.delimiter doit être une chaîne de caractères.');
    return false;
  }
  return true;
}

function validateMatchConfig(value: unknown, errors: string[]): boolean {
  if (!isRecord(value)) {
    errors.push('La section "match" doit être un objet.');
    return false;
  }
  if (value.expectedHeaders !== undefined && !isStringArray(value.expectedHeaders)) {
    errors.push('match.expectedHeaders doit être un tableau de chaînes.');
    return false;
  }
  if (value.strictMode !== undefined && typeof value.strictMode !== 'boolean') {
    errors.push('match.strictMode doit être un booléen.');
    return false;
  }
  return true;
}

function validateColumnFormatConfig(
  key: string,
  value: unknown,
  errors: string[],
): boolean {
  if (!isRecord(value)) {
    errors.push(`columns.formats.${key} doit être un objet.`);
    return false;
  }
  if (typeof value.type !== 'string' || !VALID_FORMAT_TYPES.has(value.type)) {
    errors.push(`columns.formats.${key}.type doit être l'un de : date, badge, splitBadges, link.`);
    return false;
  }
  switch (value.type) {
    case 'date':
      if (value.inputFormat !== undefined && !VALID_DATE_FORMATS.has(value.inputFormat as string)) {
        errors.push(`columns.formats.${key}.inputFormat invalide.`);
        return false;
      }
      if (value.outputFormat !== undefined && !VALID_DATE_FORMATS.has(value.outputFormat as string)) {
        errors.push(`columns.formats.${key}.outputFormat invalide.`);
        return false;
      }
      break;
    case 'badge':
      if (!isRecord(value.map)) {
        errors.push(`columns.formats.${key}.map doit être un objet.`);
        return false;
      }
      for (const [mapKey, mapValue] of Object.entries(value.map)) {
        if (!isRecord(mapValue) || typeof mapValue.color !== 'string') {
          errors.push(`columns.formats.${key}.map.${mapKey} invalide.`);
          return false;
        }
        if (mapValue.variant !== undefined && !VALID_BADGE_VARIANTS.has(mapValue.variant as string)) {
          errors.push(`columns.formats.${key}.map.${mapKey}.variant invalide.`);
          return false;
        }
      }
      break;
    case 'splitBadges':
      if (!['|', ',', ';'].includes(value.separator as string)) {
        errors.push(`columns.formats.${key}.separator doit être |, , ou ;.`);
        return false;
      }
      break;
    case 'link':
      if (!VALID_LINK_TYPES.has(value.linkType as string)) {
        errors.push(`columns.formats.${key}.linkType doit être mailto, tel ou url.`);
        return false;
      }
      break;
  }
  return true;
}

function validateComputedColumnConfig(
  key: string,
  value: unknown,
  errors: string[]
): boolean {
  if (!isRecord(value)) {
    errors.push(`columns.computed.${key}: doit être un objet`);
    return false;
  }

  if (value.type === 'ageFromDate') {
    if (typeof value.sourceColumn !== 'string') {
      errors.push(`columns.computed.${key}: sourceColumn doit être une string`);
      return false;
    }
    if (!VALID_COMPUTED_DATE_FORMATS.has(value.dateFormat as string)) {
      errors.push(`columns.computed.${key}: dateFormat doit être l'un de : excel, YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY`);
      return false;
    }
    return true;
  }

  errors.push(`columns.computed.${key}: type "${value.type}" non supporté`);
  return false;
}

function validateComputedColumnsConfig(
  value: unknown,
  errors: string[]
): boolean {
  if (!isRecord(value)) {
    errors.push('columns.computed: doit être un objet');
    return false;
  }

  let allValid = true;
  for (const [key, config] of Object.entries(value)) {
    if (!validateComputedColumnConfig(key, config, errors)) {
      allValid = false;
    }
  }
  return allValid;
}

function validateColumnsConfig(value: unknown, errors: string[]): boolean {
  if (!isRecord(value)) {
    errors.push('La section "columns" doit être un objet.');
    return false;
  }
  if (value.defaultVisible !== undefined && !isStringArray(value.defaultVisible)) {
    errors.push('columns.defaultVisible doit être un tableau de chaînes.');
    return false;
  }
  if (value.labels !== undefined) {
    if (!isRecord(value.labels)) {
      errors.push('columns.labels doit être un objet.');
      return false;
    }
    for (const val of Object.values(value.labels)) {
      if (typeof val !== 'string') {
        errors.push('columns.labels : toutes les valeurs doivent être des chaînes.');
        return false;
      }
    }
  }
  if (value.aliases !== undefined) {
    if (!isRecord(value.aliases)) {
      errors.push('columns.aliases doit être un objet.');
      return false;
    }
  }
  if (value.formats !== undefined) {
    if (!isRecord(value.formats)) {
      errors.push('columns.formats doit être un objet.');
      return false;
    }
    for (const [key, formatValue] of Object.entries(value.formats)) {
      if (!validateColumnFormatConfig(key, formatValue, errors)) return false;
    }
  }
  if (value.computed !== undefined) {
    if (!validateComputedColumnsConfig(value.computed, errors)) {
      return false;
    }
  }
  return true;
}

function validateFiltersConfig(value: unknown, errors: string[]): boolean {
  if (!isRecord(value)) {
    errors.push('La section "filters" doit être un objet.');
    return false;
  }
  const arrayKeys = ['globalSearchColumns', 'dropdown', 'text', 'dateRange', 'numberRange', 'boolean', 'multiSelect'];
  for (const key of arrayKeys) {
    if (value[key] !== undefined && !isStringArray(value[key])) {
      errors.push(`filters.${key} doit être un tableau de chaînes.`);
      return false;
    }
  }
  return true;
}

function validateStatsCardConfig(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (value.type === 'count') {
    return typeof value.label === 'string';
  }
  if (value.type === 'countWhere') {
    return typeof value.label === 'string' && typeof value.column === 'string' && typeof value.value === 'string';
  }
  return false;
}

function validateStatsPanelConfig(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const validTypes = ['countByColumn', 'countByYearFromDate', 'countBySplitValues', 'numericStats'];

  if (!validTypes.includes(value.type as string)) return false;
  if (typeof value.column !== 'string') return false;
  if (typeof value.label !== 'string') return false;

  // unit est optionnel pour numericStats
  if (value.type === 'numericStats' && value.unit !== undefined) {
    if (typeof value.unit !== 'string') return false;
  }

  return true;
}

function validateStatsConfig(value: unknown, errors: string[]): boolean {
  if (!isRecord(value)) {
    errors.push('La section "stats" doit être un objet.');
    return false;
  }
  if (value.cards !== undefined) {
    if (!Array.isArray(value.cards)) {
      errors.push('stats.cards doit être un tableau.');
      return false;
    }
    for (const card of value.cards) {
      if (!validateStatsCardConfig(card)) {
        errors.push('stats.cards contient un élément invalide.');
        return false;
      }
    }
  }
  if (value.panels !== undefined) {
    if (!Array.isArray(value.panels)) {
      errors.push('stats.panels doit être un tableau.');
      return false;
    }
    for (const panel of value.panels) {
      if (!validateStatsPanelConfig(panel)) {
        errors.push('stats.panels contient un élément invalide.');
        return false;
      }
    }
  }
  return true;
}

function validateDetailModalConfig(value: unknown, errors: string[]): boolean {
  if (!isRecord(value)) {
    errors.push('La section "detailModal" doit être un objet.');
    return false;
  }
  if (value.titleTemplate !== undefined && typeof value.titleTemplate !== 'string') {
    errors.push('detailModal.titleTemplate doit être une chaîne de caractères.');
    return false;
  }
  if (value.sections !== undefined) {
    if (!Array.isArray(value.sections)) {
      errors.push('detailModal.sections doit être un tableau.');
      return false;
    }
    for (const section of value.sections) {
      if (!isRecord(section) || typeof section.title !== 'string' || !isStringArray(section.fields)) {
        errors.push('detailModal.sections contient un élément invalide (title: string, fields: string[] requis).');
        return false;
      }
    }
  }
  return true;
}

export function validateConfigAndReturnResult(rawConfig: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(rawConfig)) {
    return {
      isValid: false,
      errors: ['La configuration doit être un objet JSON valide.'],
    };
  }

  // Vérifier les clés inconnues
  for (const key of Object.keys(rawConfig)) {
    if (!VALID_TOP_LEVEL_KEYS.has(key)) {
      errors.push(`Clé inconnue "${key}". Clés valides : ${[...VALID_TOP_LEVEL_KEYS].join(', ')}.`);
    }
  }
  if (errors.length > 0) return { isValid: false, errors };

  const validators: Record<string, (value: unknown, errors: string[]) => boolean> = {
    app: validateAppConfig,
    csv: validateCSVConfig,
    match: validateMatchConfig,
    columns: validateColumnsConfig,
    filters: validateFiltersConfig,
    stats: validateStatsConfig,
    detailModal: validateDetailModalConfig,
  };

  for (const [key, value] of Object.entries(rawConfig)) {
    const validator = validators[key];
    if (validator && !validator(value, errors)) {
      return { isValid: false, errors };
    }
  }

  return { isValid: true, config: rawConfig as Config };
}
