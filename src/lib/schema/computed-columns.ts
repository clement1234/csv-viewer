import type { DataRow } from '../../types/core.types';
import type { ComputedColumnConfig, ComputedColumnsConfig, DateFormat } from '../../types/config.types';
import { parseDateStringToDateObject } from '../utils/date-utils';

/**
 * Convertit un nombre Excel en âge.
 * Excel stocke les dates comme nombre de jours depuis 1900-01-01.
 *
 * @param excelNumber - Nombre Excel représentant une date
 * @returns Âge calculé ou null si invalide
 */
export function parseExcelDateToAge(excelNumber: number): number | null {
  // Vérifier que le nombre est valide
  if (isNaN(excelNumber) || excelNumber < 0 || excelNumber > 60000) {
    return null;
  }

  try {
    // Conversion Excel → Date JavaScript
    // Excel compte depuis 1900-01-01, JavaScript depuis 1970-01-01
    // Différence = 25569 jours
    const millisecondsPerDay = 86400 * 1000;
    const excelEpochOffset = 25569;
    const dateMilliseconds = (excelNumber - excelEpochOffset) * millisecondsPerDay;
    const birthDate = new Date(dateMilliseconds);

    // Vérifier que la date est valide
    if (isNaN(birthDate.getTime())) {
      return null;
    }

    // Calculer l'âge
    const now = Date.now();
    const ageInMilliseconds = now - birthDate.getTime();
    const ageInYears = ageInMilliseconds / (365.25 * 24 * 60 * 60 * 1000);

    // Arrondir à l'entier inférieur (on a X ans jusqu'à notre anniversaire)
    const age = Math.floor(ageInYears);

    // Vérifier que l'âge est raisonnable (entre 0 et 150 ans)
    if (age < 0 || age > 150) {
      return null;
    }

    return age;
  } catch {
    return null;
  }
}

/**
 * Parse une date string selon le format spécifié et calcule l'âge.
 *
 * @param dateStr - String représentant une date
 * @param format - Format de la date ('YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', ou 'excel')
 * @returns Âge calculé ou null si invalide
 */
export function parseDateStringToAge(
  dateStr: string,
  format: DateFormat | 'excel'
): number | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  try {
    if (format === 'excel') {
      // Tenter de parser comme nombre Excel
      const excelNumber = parseFloat(dateStr);
      return parseExcelDateToAge(excelNumber);
    }

    // Parser la date string selon le format spécifié
    const birthDate = parseDateStringToDateObject(dateStr, format);

    if (!birthDate || isNaN(birthDate.getTime())) {
      return null;
    }

    // Calculer l'âge
    const now = Date.now();
    const ageInMilliseconds = now - birthDate.getTime();
    const ageInYears = ageInMilliseconds / (365.25 * 24 * 60 * 60 * 1000);
    const age = Math.floor(ageInYears);

    // Vérifier que l'âge est raisonnable
    if (age < 0 || age > 150) {
      return null;
    }

    return age;
  } catch {
    return null;
  }
}

/**
 * Applique une colonne calculée à toutes les lignes de données.
 *
 * @param data - Tableau de lignes de données
 * @param targetColumnName - Nom de la nouvelle colonne calculée
 * @param config - Configuration de la colonne calculée
 * @returns Nouveau tableau avec la colonne calculée ajoutée
 */
export function applyComputedColumn(
  data: DataRow[],
  targetColumnName: string,
  config: ComputedColumnConfig
): DataRow[] {
  // Vérifier si la colonne source existe dans au moins une ligne
  const hasSourceColumn = data.some(row => config.sourceColumn in row);

  if (!hasSourceColumn && data.length > 0) {
    console.error(
      `Colonne source "${config.sourceColumn}" introuvable pour la colonne calculée "${targetColumnName}"`
    );
  }

  return data.map(row => {
    const newRow = { ...row };

    if (config.type === 'ageFromDate') {
      const sourceValue = row[config.sourceColumn];

      if (sourceValue === null || sourceValue === undefined) {
        newRow[targetColumnName] = '';
        return newRow;
      }

      let age: number | null = null;

      // Les valeurs dans DataRow sont toujours des strings
      // Pour les dates Excel, elles sont stockées comme string de nombre
      if (config.dateFormat === 'excel') {
        const excelNumber = parseFloat(sourceValue);
        if (!isNaN(excelNumber)) {
          age = parseExcelDateToAge(excelNumber);
        }
      } else {
        // Autres formats de date
        age = parseDateStringToAge(sourceValue, config.dateFormat);
      }

      newRow[targetColumnName] = age !== null ? String(age) : '';
    }

    return newRow;
  });
}

/**
 * Applique toutes les colonnes calculées définies dans la configuration.
 *
 * @param data - Tableau de lignes de données
 * @param computedConfig - Configuration de toutes les colonnes calculées
 * @returns Nouveau tableau avec toutes les colonnes calculées ajoutées
 */
export function applyComputedColumnsToDataRows(
  data: DataRow[],
  computedConfig: ComputedColumnsConfig
): DataRow[] {
  // Si aucune colonne calculée, retourner une copie pour cohérence
  if (Object.keys(computedConfig).length === 0) {
    return [...data];
  }

  let processedData = data;

  // Appliquer chaque colonne calculée séquentiellement
  for (const [columnName, config] of Object.entries(computedConfig)) {
    processedData = applyComputedColumn(processedData, columnName, config);
  }

  return processedData;
}
