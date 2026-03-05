import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import {
  parseXLSXFirstSheetWithAvailableSheets,
  extractRowsFromSpecificSheet,
} from '../xlsx-parser.ts';

function createXLSXFile(
  sheets: { name: string; data: (string | number | Date | null)[][] }[],
  filename = 'test.xlsx',
): File {
  const workbook = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }
  const buffer = XLSX.write(workbook, { type: 'array' });
  return new File([buffer], filename, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

describe('parseXLSXFirstSheetWithAvailableSheets', () => {
  it('should parse basic XLSX with first sheet data', async () => {
    const file = createXLSXFile([
      { name: 'Feuille1', data: [['Nom', 'Age'], ['Dupont', '30'], ['Martin', '25']] },
    ]);
    const result = await parseXLSXFirstSheetWithAvailableSheets(file);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]['nom']).toBe('Dupont');
    expect(result.data[0]['age']).toBe('30');
  });

  it('should return all available sheet names', async () => {
    const file = createXLSXFile([
      { name: 'Feuille1', data: [['Nom'], ['A']] },
      { name: 'Feuille2', data: [['Nom'], ['B']] },
      { name: 'Feuille3', data: [['Nom'], ['C']] },
    ]);
    const result = await parseXLSXFirstSheetWithAvailableSheets(file);
    expect(result.availableSheetNames).toEqual(['Feuille1', 'Feuille2', 'Feuille3']);
  });

  it('should return data from first sheet only', async () => {
    const file = createXLSXFile([
      { name: 'First', data: [['Nom'], ['Dupont']] },
      { name: 'Second', data: [['Nom'], ['Martin']] },
    ]);
    const result = await parseXLSXFirstSheetWithAvailableSheets(file);
    expect(result.data[0]['nom']).toBe('Dupont');
  });

  it('should normalize header names', async () => {
    const file = createXLSXFile([
      { name: 'S1', data: [['Prénom', 'Email Address'], ['Jean', 'j@test.com']] },
    ]);
    const result = await parseXLSXFirstSheetWithAvailableSheets(file);
    expect(Object.keys(result.data[0])).toContain('prenom');
    expect(Object.keys(result.data[0])).toContain('email_address');
  });

  it('should handle empty cells as empty strings', async () => {
    const file = createXLSXFile([
      { name: 'S1', data: [['Nom', 'Prenom'], ['Dupont', null]] },
    ]);
    const result = await parseXLSXFirstSheetWithAvailableSheets(file);
    expect(result.data[0]['prenom']).toBe('');
  });

  it('should throw error for empty file', async () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empty');
    const buffer = XLSX.write(workbook, { type: 'array' });
    const file = new File([buffer], 'empty.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    await expect(parseXLSXFirstSheetWithAvailableSheets(file)).rejects.toThrow();
  });

  it('should deduplicate identical header names', async () => {
    const file = createXLSXFile([
      { name: 'S1', data: [['Nom', 'Nom', 'Nom'], ['A', 'B', 'C']] },
    ]);
    const result = await parseXLSXFirstSheetWithAvailableSheets(file);
    const keys = Object.keys(result.data[0]);
    expect(keys).toContain('nom');
    expect(keys).toContain('nom_2');
    expect(keys).toContain('nom_3');
  });

  it('should handle numeric values as strings', async () => {
    const file = createXLSXFile([
      { name: 'S1', data: [['Nom', 'Age'], ['Dupont', 30]] },
    ]);
    const result = await parseXLSXFirstSheetWithAvailableSheets(file);
    expect(result.data[0]['age']).toBe('30');
  });
});

describe('extractRowsFromSpecificSheet', () => {
  it('should extract data from a specific sheet', async () => {
    const file = createXLSXFile([
      { name: 'First', data: [['Nom'], ['Dupont']] },
      { name: 'Second', data: [['Nom'], ['Martin']] },
    ]);
    const rows = await extractRowsFromSpecificSheet(file, 'Second');
    expect(rows).toHaveLength(1);
    expect(rows[0]['nom']).toBe('Martin');
  });

  it('should throw error for non-existent sheet', async () => {
    const file = createXLSXFile([
      { name: 'First', data: [['Nom'], ['Dupont']] },
    ]);
    await expect(extractRowsFromSpecificSheet(file, 'NonExistent')).rejects.toThrow(
      'NonExistent',
    );
  });

  it('should normalize headers from specific sheet', async () => {
    const file = createXLSXFile([
      { name: 'S1', data: [['Prénom'], ['Jean']] },
    ]);
    const rows = await extractRowsFromSpecificSheet(file, 'S1');
    expect(Object.keys(rows[0])).toContain('prenom');
  });

  it('should throw error for empty specific sheet', async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Nom']]), 'HasData');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([]), 'Empty');
    const buffer = XLSX.write(workbook, { type: 'array' });
    const file = new File([buffer], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    await expect(extractRowsFromSpecificSheet(file, 'Empty')).rejects.toThrow();
  });

  it('should handle large files with many rows', async () => {
    // Test de régression : vérifier que la détection manuelle des lignes fonctionne
    // en créant un fichier avec beaucoup de lignes
    const data: (string | number)[][] = [['ID', 'Nom', 'Email']];
    for (let i = 1; i <= 100; i++) {
      data.push([i, `User${i}`, `user${i}@test.com`]);
    }

    const file = createXLSXFile([{ name: 'Data', data }]);
    const result = await parseXLSXFirstSheetWithAvailableSheets(file);

    // Vérifier que toutes les lignes sont bien détectées
    expect(result.data).toHaveLength(100);
    expect(result.data[0]['nom']).toBe('User1');
    expect(result.data[99]['nom']).toBe('User100');
  });
});
