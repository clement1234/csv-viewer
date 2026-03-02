import Papa from 'papaparse';
import type { DataRow } from '../../types/core.types.ts';
import { trimAndNormalizeString, normalizeColumnNamesWithDeduplication } from '../utils/string-utils.ts';

export function parseCSVFileToNormalizedRows(
  file: File,
  customDelimiter?: string,
): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: false,
      delimiter: customDelimiter ?? '',
      complete: (results) => {
        if (results.data.length === 0) {
          reject(new Error('Le fichier CSV est vide ou ne contient pas de headers.'));
          return;
        }

        const rawHeaders = results.data[0];
        const dataRows = results.data.slice(1);

        if (dataRows.length === 0) {
          reject(new Error('Le fichier CSV ne contient aucune donnée (uniquement des headers).'));
          return;
        }

        const normalizedHeaders = normalizeColumnNamesWithDeduplication(rawHeaders);

        const remappedRows: DataRow[] = dataRows.map((row) => {
          const newRow: DataRow = {};
          normalizedHeaders.forEach((key, colIndex) => {
            newRow[key] = trimAndNormalizeString(row[colIndex]);
          });
          return newRow;
        });

        resolve(remappedRows);
      },
      error: (error: Error) => {
        reject(new Error(`Erreur de parsing CSV : ${error.message}`));
      },
    });
  });
}
