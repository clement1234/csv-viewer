import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseExcelDateToAge,
  parseDateStringToAge,
  applyComputedColumn,
  applyComputedColumnsToDataRows,
} from '../computed-columns';
import type { DataRow } from '../../../types/core.types';
import type { ComputedColumnConfig } from '../../../types/config.types';

describe('parseExcelDateToAge', () => {
  beforeEach(() => {
    // Fixer la date au 2026-01-01 pour des tests déterministes
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should parse valid Excel date to age', () => {
    // 44562 = 2021-12-25 (environ 4 ans avant 2026-01-01)
    const age = parseExcelDateToAge(44562);
    expect(age).toBe(4);
  });

  it('should parse Excel date for person born in 1985', () => {
    // 31046 = 1985-01-01 (41 ans avant 2026-01-01)
    const age = parseExcelDateToAge(31046);
    expect(age).toBe(41);
  });

  it('should parse Excel date for person born in 1990', () => {
    // 32874 = 1990-01-01 (36 ans avant 2026-01-01)
    const age = parseExcelDateToAge(32874);
    expect(age).toBe(36);
  });

  it('should return null for invalid Excel date (negative)', () => {
    const age = parseExcelDateToAge(-100);
    expect(age).toBeNull();
  });

  it('should return null for invalid Excel date (too large)', () => {
    const age = parseExcelDateToAge(100000);
    expect(age).toBeNull();
  });

  it('should return null for NaN', () => {
    const age = parseExcelDateToAge(NaN);
    expect(age).toBeNull();
  });
});

describe('parseDateStringToAge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should parse ISO date string to age', () => {
    const age = parseDateStringToAge('1985-03-15', 'YYYY-MM-DD');
    expect(age).toBe(40); // 2026 - 1985 - 1 (avant l'anniversaire)
  });

  it('should parse DD/MM/YYYY date string to age', () => {
    const age = parseDateStringToAge('15/03/1985', 'DD/MM/YYYY');
    expect(age).toBe(40);
  });

  it('should parse MM/DD/YYYY date string to age', () => {
    const age = parseDateStringToAge('03/15/1985', 'MM/DD/YYYY');
    expect(age).toBe(40);
  });

  it('should handle Excel number as string', () => {
    // 32874 = 1990-01-01
    const age = parseDateStringToAge('32874', 'excel');
    expect(age).toBe(36);
  });

  it('should return null for invalid date string', () => {
    const age = parseDateStringToAge('invalid', 'YYYY-MM-DD');
    expect(age).toBeNull();
  });

  it('should return null for malformed DD/MM/YYYY', () => {
    const age = parseDateStringToAge('32/13/1985', 'DD/MM/YYYY');
    expect(age).toBeNull();
  });

  it('should return null for empty string', () => {
    const age = parseDateStringToAge('', 'YYYY-MM-DD');
    expect(age).toBeNull();
  });
});

describe('applyComputedColumn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should add age column from Excel date', () => {
    const rows: DataRow[] = [
      { id: '1', name: 'Alice', birthDate: '31046' }, // 1985-01-01
      { id: '2', name: 'Bob', birthDate: '32874' },   // 1990-01-01
    ];

    const config: ComputedColumnConfig = {
      type: 'ageFromDate',
      sourceColumn: 'birthDate',
      dateFormat: 'excel',
    };

    const result = applyComputedColumn(rows, 'age', config);

    expect(result[0].age).toBe('41');
    expect(result[1].age).toBe('36');
  });

  it('should add age column from ISO date string', () => {
    const rows: DataRow[] = [
      { id: '1', name: 'Alice', birthDate: '1985-03-15' },
      { id: '2', name: 'Bob', birthDate: '1990-06-20' },
    ];

    const config: ComputedColumnConfig = {
      type: 'ageFromDate',
      sourceColumn: 'birthDate',
      dateFormat: 'YYYY-MM-DD',
    };

    const result = applyComputedColumn(rows, 'age', config);

    expect(result[0].age).toBe('40');
    expect(result[1].age).toBe('35');
  });

  it('should add age column from DD/MM/YYYY date string', () => {
    const rows: DataRow[] = [
      { id: '1', name: 'Alice', birthDate: '15/03/1985' },
      { id: '2', name: 'Bob', birthDate: '20/06/1990' },
    ];

    const config: ComputedColumnConfig = {
      type: 'ageFromDate',
      sourceColumn: 'birthDate',
      dateFormat: 'DD/MM/YYYY',
    };

    const result = applyComputedColumn(rows, 'age', config);

    expect(result[0].age).toBe('40');
    expect(result[1].age).toBe('35');
  });

  it('should handle missing source column gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const rows: DataRow[] = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];

    const config: ComputedColumnConfig = {
      type: 'ageFromDate',
      sourceColumn: 'birthDate',
      dateFormat: 'excel',
    };

    const result = applyComputedColumn(rows, 'age', config);

    expect(result[0].age).toBe('');
    expect(result[1].age).toBe('');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Colonne source "birthDate" introuvable pour la colonne calculée "age"'
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle invalid dates by setting empty string', () => {
    const rows: DataRow[] = [
      { id: '1', name: 'Alice', birthDate: 'invalid' },
      { id: '2', name: 'Bob', birthDate: '' },
      { id: '3', name: 'Charlie', birthDate: '' },
    ];

    const config: ComputedColumnConfig = {
      type: 'ageFromDate',
      sourceColumn: 'birthDate',
      dateFormat: 'excel',
    };

    const result = applyComputedColumn(rows, 'age', config);

    expect(result[0].age).toBe('');
    expect(result[1].age).toBe('');
    expect(result[2].age).toBe('');
  });

  it('should not mutate original rows', () => {
    const rows: DataRow[] = [
      { id: '1', name: 'Alice', birthDate: '31046' },
    ];

    const config: ComputedColumnConfig = {
      type: 'ageFromDate',
      sourceColumn: 'birthDate',
      dateFormat: 'excel',
    };

    const result = applyComputedColumn(rows, 'age', config);

    expect(result).not.toBe(rows);
    expect(result[0]).not.toBe(rows[0]);
    expect(rows[0].age).toBeUndefined();
  });
});

describe('applyComputedColumnsToDataRows', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should apply multiple computed columns', () => {
    const rows: DataRow[] = [
      { id: '1', name: 'Alice', birthDate: '31046', joinDate: '44562' },
    ];

    const config = {
      age: {
        type: 'ageFromDate' as const,
        sourceColumn: 'birthDate',
        dateFormat: 'excel' as const,
      },
      yearsOfService: {
        type: 'ageFromDate' as const,
        sourceColumn: 'joinDate',
        dateFormat: 'excel' as const,
      },
    };

    const result = applyComputedColumnsToDataRows(rows, config);

    expect(result[0].age).toBe('41');
    expect(result[0].yearsOfService).toBe('4');
  });

  it('should handle empty config', () => {
    const rows: DataRow[] = [
      { id: '1', name: 'Alice' },
    ];

    const result = applyComputedColumnsToDataRows(rows, {});

    expect(result).toEqual(rows);
    expect(result).not.toBe(rows); // Should still create new array
  });

  it('should handle empty rows', () => {
    const config = {
      age: {
        type: 'ageFromDate' as const,
        sourceColumn: 'birthDate',
        dateFormat: 'excel' as const,
      },
    };

    const result = applyComputedColumnsToDataRows([], config);

    expect(result).toEqual([]);
  });

  it('should preserve existing columns', () => {
    const rows: DataRow[] = [
      { id: '1', name: 'Alice', birthDate: '31046', status: 'active' },
    ];

    const config = {
      age: {
        type: 'ageFromDate' as const,
        sourceColumn: 'birthDate',
        dateFormat: 'excel' as const,
      },
    };

    const result = applyComputedColumnsToDataRows(rows, config);

    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Alice');
    expect(result[0].birthDate).toBe('31046');
    expect(result[0].status).toBe('active');
    expect(result[0].age).toBe('41');
  });

  it('should process columns sequentially', () => {
    const rows: DataRow[] = [
      { id: '1', name: 'Alice', birthDate: '31046' },
      { id: '2', name: 'Bob', birthDate: '32874' },
    ];

    const config = {
      age: {
        type: 'ageFromDate' as const,
        sourceColumn: 'birthDate',
        dateFormat: 'excel' as const,
      },
      ageGroup: {
        type: 'ageFromDate' as const,
        sourceColumn: 'birthDate',
        dateFormat: 'excel' as const,
      },
    };

    const result = applyComputedColumnsToDataRows(rows, config);

    expect(result[0].age).toBe('41');
    expect(result[0].ageGroup).toBe('41');
    expect(result[1].age).toBe('36');
    expect(result[1].ageGroup).toBe('36');
  });
});
