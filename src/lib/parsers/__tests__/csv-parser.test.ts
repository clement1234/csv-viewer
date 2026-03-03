import { describe, it, expect } from 'vitest';
import { parseCSVFileToNormalizedRows } from '../csv-parser.ts';

function createCSVFile(content: string, name = 'test.csv'): File {
  return new File([content], name, { type: 'text/csv' });
}

describe('parseCSVFileToNormalizedRows', () => {
  it('should parse a basic CSV with comma delimiter', async () => {
    const file = createCSVFile('Nom,Prenom,Age\nDupont,Jean,30\nMartin,Paul,25');
    const rows = await parseCSVFileToNormalizedRows(file);
    expect(rows).toHaveLength(2);
    expect(rows[0]['nom']).toBe('Dupont');
    expect(rows[0]['prenom']).toBe('Jean');
    expect(rows[0]['age']).toBe('30');
  });

  it('should trim whitespace from values', async () => {
    const file = createCSVFile('Nom,Prenom\n  Dupont  , Jean ');
    const rows = await parseCSVFileToNormalizedRows(file);
    expect(rows[0]['nom']).toBe('Dupont');
    expect(rows[0]['prenom']).toBe('Jean');
  });

  it('should normalize header names', async () => {
    const file = createCSVFile('Prénom,Email Address\nJean,jean@test.com');
    const rows = await parseCSVFileToNormalizedRows(file);
    expect(Object.keys(rows[0])).toContain('prenom');
    expect(Object.keys(rows[0])).toContain('email_address');
  });

  it('should auto-detect semicolon delimiter', async () => {
    const file = createCSVFile('Nom;Prenom;Age\nDupont;Jean;30');
    const rows = await parseCSVFileToNormalizedRows(file);
    expect(rows).toHaveLength(1);
    expect(rows[0]['nom']).toBe('Dupont');
  });

  it('should auto-detect pipe delimiter', async () => {
    const file = createCSVFile('Nom|Prenom|Age\nDupont|Jean|30');
    const rows = await parseCSVFileToNormalizedRows(file);
    expect(rows).toHaveLength(1);
    expect(rows[0]['nom']).toBe('Dupont');
  });

  it('should use custom delimiter when provided', async () => {
    const file = createCSVFile('Nom\tPrenom\tAge\nDupont\tJean\t30');
    const rows = await parseCSVFileToNormalizedRows(file, '\t');
    expect(rows).toHaveLength(1);
    expect(rows[0]['nom']).toBe('Dupont');
  });

  it('should handle empty cell values', async () => {
    const file = createCSVFile('Nom,Prenom,Age\nDupont,,30');
    const rows = await parseCSVFileToNormalizedRows(file);
    expect(rows[0]['prenom']).toBe('');
  });

  it('should throw error for empty file', async () => {
    const file = createCSVFile('');
    await expect(parseCSVFileToNormalizedRows(file)).rejects.toThrow();
  });

  it('should throw error for file with only headers', async () => {
    const file = createCSVFile('Nom,Prenom,Age\n');
    await expect(parseCSVFileToNormalizedRows(file)).rejects.toThrow();
  });

  it('should deduplicate identical header names', async () => {
    const file = createCSVFile('Nom,Nom,Nom\nA,B,C');
    const rows = await parseCSVFileToNormalizedRows(file);
    const keys = Object.keys(rows[0]);
    expect(keys).toContain('nom');
    expect(keys).toContain('nom_2');
    expect(keys).toContain('nom_3');
  });

  it('should skip empty lines', async () => {
    const file = createCSVFile('Nom,Prenom\nDupont,Jean\n\nMartin,Paul\n');
    const rows = await parseCSVFileToNormalizedRows(file);
    expect(rows).toHaveLength(2);
  });
});
