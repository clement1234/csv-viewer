import type { DataRow } from '../../types/core.types';

export interface NumericStatsResult {
  mean: number;
  min: number;
  q1: number;
  q2: number; // médiane
  q3: number;
  q4: number; // max
  stdDev: number;
  count: number;
}

/**
 * Extrait les valeurs numériques valides d'une colonne donnée.
 * Filtre les valeurs non-numériques, null, undefined, et string vides.
 */
export function extractNumericValuesFromColumn(
  rows: DataRow[],
  columnName: string
): number[] {
  const values: number[] = [];

  for (const row of rows) {
    const value = row[columnName];

    // Les valeurs dans DataRow sont toujours des strings
    // Tenter de parser en nombre
    if (value && value !== '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        values.push(numValue);
      }
    }
  }

  return values;
}

/**
 * Calcule un quartile spécifique d'un tableau de valeurs triées.
 * Utilise l'interpolation linéaire pour les positions entre deux valeurs.
 *
 * @param sortedValues - Tableau de nombres déjà triés en ordre croissant
 * @param quartile - Position du quartile (0.25 pour Q1, 0.5 pour Q2, 0.75 pour Q3, 1.0 pour Q4)
 */
export function calculateQuartile(
  sortedValues: number[],
  quartile: number
): number {
  if (sortedValues.length === 0) {
    return 0;
  }

  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  // Position dans le tableau (index basé sur 0)
  const position = (sortedValues.length - 1) * quartile;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const fraction = position - lowerIndex;

  // Si la position tombe exactement sur un index, retourner cette valeur
  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex];
  }

  // Sinon, interpoler entre les deux valeurs
  const lowerValue = sortedValues[lowerIndex];
  const upperValue = sortedValues[upperIndex];
  return lowerValue + (upperValue - lowerValue) * fraction;
}

/**
 * Calcule la moyenne arithmétique d'un tableau de valeurs.
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calcule l'écart-type d'un tableau de valeurs.
 * Utilise la formule de l'écart-type d'un échantillon (n-1 au dénominateur).
 *
 * @param values - Tableau de nombres
 * @param mean - Moyenne pré-calculée des valeurs
 */
export function calculateStandardDeviation(
  values: number[],
  mean: number
): number {
  if (values.length <= 1) {
    return 0;
  }

  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calcule toutes les statistiques numériques pour un tableau de valeurs.
 * Retourne null si le tableau est vide.
 *
 * Les quartiles retournés sont :
 * - min: valeur minimale
 * - q1: 25e percentile
 * - q2: médiane (50e percentile)
 * - q3: 75e percentile
 * - q4: valeur maximale (100e percentile)
 */
export function calculateNumericStats(
  values: number[]
): NumericStatsResult | null {
  if (values.length === 0) {
    return null;
  }

  // Trier les valeurs pour le calcul des quartiles
  const sortedValues = [...values].sort((a, b) => a - b);

  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values, mean);

  return {
    mean,
    min: sortedValues[0],
    q1: calculateQuartile(sortedValues, 0.25),
    q2: calculateQuartile(sortedValues, 0.5),
    q3: calculateQuartile(sortedValues, 0.75),
    q4: sortedValues[sortedValues.length - 1],
    stdDev,
    count: values.length,
  };
}
