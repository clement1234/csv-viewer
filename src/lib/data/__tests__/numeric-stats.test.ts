import { describe, it, expect } from 'vitest';
import {
  extractNumericValuesFromColumn,
  calculateQuartile,
  calculateMean,
  calculateStandardDeviation,
  calculateNumericStats,
  type NumericStatsResult,
} from '../numeric-stats';
import type { DataRow } from '../../../types/core.types';

describe('extractNumericValuesFromColumn', () => {
  it('should extract valid numeric values', () => {
    const rows: DataRow[] = [
      { id: '1', age: '25' },
      { id: '2', age: '30' },
      { id: '3', age: '35' },
    ];
    const result = extractNumericValuesFromColumn(rows, 'age');
    expect(result).toEqual([25, 30, 35]);
  });

  it('should filter out non-numeric values', () => {
    const rows: DataRow[] = [
      { id: '1', age: '25' },
      { id: '2', age: 'invalid' },
      { id: '3', age: '30' },
      { id: '4', age: '' },
    ];
    const result = extractNumericValuesFromColumn(rows, 'age');
    expect(result).toEqual([25, 30]);
  });

  it('should handle missing column', () => {
    const rows: DataRow[] = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];
    const result = extractNumericValuesFromColumn(rows, 'age');
    expect(result).toEqual([]);
  });

  it('should handle empty dataset', () => {
    const result = extractNumericValuesFromColumn([], 'age');
    expect(result).toEqual([]);
  });

  it('should handle mixed numeric types (integers and floats)', () => {
    const rows: DataRow[] = [
      { id: '1', value: '10' },
      { id: '2', value: '20.5' },
      { id: '3', value: '30' },
    ];
    const result = extractNumericValuesFromColumn(rows, 'value');
    expect(result).toEqual([10, 20.5, 30]);
  });
});

describe('calculateQuartile', () => {
  it('should calculate Q1 (25th percentile)', () => {
    const values = [22, 35, 41, 50, 78];
    const q1 = calculateQuartile(values, 0.25);
    expect(q1).toBe(35);
  });

  it('should calculate Q2 (median, 50th percentile)', () => {
    const values = [22, 35, 41, 50, 78];
    const q2 = calculateQuartile(values, 0.5);
    expect(q2).toBe(41);
  });

  it('should calculate Q3 (75th percentile)', () => {
    const values = [22, 35, 41, 50, 78];
    const q3 = calculateQuartile(values, 0.75);
    expect(q3).toBe(50);
  });

  it('should calculate Q4 (max, 100th percentile)', () => {
    const values = [22, 35, 41, 50, 78];
    const q4 = calculateQuartile(values, 1.0);
    expect(q4).toBe(78);
  });

  it('should handle interpolation for even-length dataset', () => {
    const values = [10, 20, 30, 40];
    const median = calculateQuartile(values, 0.5);
    expect(median).toBe(25); // (20 + 30) / 2
  });

  it('should handle single value', () => {
    const values = [42];
    expect(calculateQuartile(values, 0.25)).toBe(42);
    expect(calculateQuartile(values, 0.5)).toBe(42);
    expect(calculateQuartile(values, 0.75)).toBe(42);
    expect(calculateQuartile(values, 1.0)).toBe(42);
  });

  it('should handle two values', () => {
    const values = [10, 20];
    expect(calculateQuartile(values, 0.25)).toBe(12.5); // Interpolation: 10 + (20-10) * 0.25
    expect(calculateQuartile(values, 0.5)).toBe(15);
    expect(calculateQuartile(values, 0.75)).toBe(17.5); // Interpolation: 10 + (20-10) * 0.75
    expect(calculateQuartile(values, 1.0)).toBe(20);
  });
});

describe('calculateMean', () => {
  it('should calculate mean for normal dataset', () => {
    const values = [10, 20, 30, 40, 50];
    const mean = calculateMean(values);
    expect(mean).toBe(30);
  });

  it('should calculate mean for single value', () => {
    const values = [42];
    const mean = calculateMean(values);
    expect(mean).toBe(42);
  });

  it('should handle decimal results', () => {
    const values = [10, 20, 25];
    const mean = calculateMean(values);
    expect(mean).toBeCloseTo(18.333, 2);
  });

  it('should handle negative values', () => {
    const values = [-10, 0, 10];
    const mean = calculateMean(values);
    expect(mean).toBe(0);
  });
});

describe('calculateStandardDeviation', () => {
  it('should calculate standard deviation for normal dataset', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const mean = calculateMean(values);
    const stdDev = calculateStandardDeviation(values, mean);
    expect(stdDev).toBeCloseTo(2, 0);
  });

  it('should return 0 for single value', () => {
    const values = [42];
    const mean = calculateMean(values);
    const stdDev = calculateStandardDeviation(values, mean);
    expect(stdDev).toBe(0);
  });

  it('should return 0 for identical values', () => {
    const values = [5, 5, 5, 5];
    const mean = calculateMean(values);
    const stdDev = calculateStandardDeviation(values, mean);
    expect(stdDev).toBe(0);
  });

  it('should calculate standard deviation with decimals', () => {
    const values = [10, 12, 23, 23, 16, 23, 21, 16];
    const mean = calculateMean(values);
    const stdDev = calculateStandardDeviation(values, mean);
    // Formule écart-type échantillon avec n-1 au dénominateur
    expect(stdDev).toBeCloseTo(5.237, 2);
  });
});

describe('calculateNumericStats', () => {
  it('should calculate all stats for normal dataset', () => {
    const values = [22, 35, 41, 50, 78];
    const stats = calculateNumericStats(values);

    expect(stats).not.toBeNull();
    expect(stats?.count).toBe(5);
    expect(stats?.min).toBe(22);
    expect(stats?.q1).toBe(35);
    expect(stats?.q2).toBe(41);
    expect(stats?.q3).toBe(50);
    expect(stats?.q4).toBe(78);
    expect(stats?.mean).toBeCloseTo(45.2, 1);
    expect(stats?.stdDev).toBeGreaterThan(0);
  });

  it('should return null for empty dataset', () => {
    const values: number[] = [];
    const stats = calculateNumericStats(values);
    expect(stats).toBeNull();
  });

  it('should calculate stats for single value', () => {
    const values = [42];
    const stats = calculateNumericStats(values);

    expect(stats).not.toBeNull();
    expect(stats?.count).toBe(1);
    expect(stats?.min).toBe(42);
    expect(stats?.q1).toBe(42);
    expect(stats?.q2).toBe(42);
    expect(stats?.q3).toBe(42);
    expect(stats?.q4).toBe(42);
    expect(stats?.mean).toBe(42);
    expect(stats?.stdDev).toBe(0);
  });

  it('should calculate stats for even-length dataset', () => {
    const values = [10, 20, 30, 40, 50, 60];
    const stats = calculateNumericStats(values);

    expect(stats).not.toBeNull();
    expect(stats?.count).toBe(6);
    expect(stats?.min).toBe(10);
    expect(stats?.q4).toBe(60);
    expect(stats?.mean).toBe(35);
    expect(stats?.q2).toBe(35); // median of [10,20,30,40,50,60]
  });

  it('should handle dataset with negative values', () => {
    const values = [-10, -5, 0, 5, 10];
    const stats = calculateNumericStats(values);

    expect(stats).not.toBeNull();
    expect(stats?.mean).toBe(0);
    expect(stats?.min).toBe(-10);
    expect(stats?.q4).toBe(10);
  });

  it('should have quartiles in ascending order', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const stats = calculateNumericStats(values) as NumericStatsResult;

    expect(stats.min).toBeLessThanOrEqual(stats.q1);
    expect(stats.q1).toBeLessThanOrEqual(stats.q2);
    expect(stats.q2).toBeLessThanOrEqual(stats.q3);
    expect(stats.q3).toBeLessThanOrEqual(stats.q4);
  });
});
