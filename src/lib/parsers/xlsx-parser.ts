import * as XLSX from 'xlsx';
import type { DataRow } from '../../types/core.types.ts';
import { trimAndNormalizeString, normalizeColumnNamesWithDeduplication } from '../utils/string-utils.ts';
import { convertExcelDateToISOString } from '../utils/date-utils.ts';

export interface ParseXLSXResult {
  data: DataRow[];
  availableSheetNames: string[];
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event): void => {
      resolve(event.target?.result as ArrayBuffer);
    };
    reader.onerror = (): void => {
      reject(new Error('Erreur lors de la lecture du fichier XLSX.'));
    };
    reader.readAsArrayBuffer(file);
  });
}

function extractAndNormalizeSheetData(
  workbook: XLSX.WorkBook,
  sheetName: string,
): DataRow[] {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(`La feuille "${sheetName}" n'existe pas dans le fichier.`);
  }

  // Détecter manuellement la dernière ligne en scannant les cellules
  // Cela permet de gérer les fichiers xlsx où !ref n'est pas correctement défini
  const cellKeys = Object.keys(worksheet).filter((key) => !key.startsWith('!'));

  // Extraire les numéros de ligne des clés de cellules (ex: A1 -> 1, B23 -> 23)
  const rowNumbers = cellKeys
    .map((key) => {
      const match = key.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter((num) => num > 0);

  const maxRow = rowNumbers.length > 0 ? Math.max(...rowNumbers) : 1;

  // Si on détecte des lignes au-delà de la ligne 1, forcer la plage
  if (maxRow > 1) {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    range.e.r = maxRow - 1; // -1 car 0-indexed
    worksheet['!ref'] = XLSX.utils.encode_range(range);
  }

  // Parser en mode array pour contrôler les headers nous-mêmes
  const allRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    raw: true,
  });

  if (allRows.length <= 1) {
    throw new Error(`La feuille "${sheetName}" ne contient aucune donnée.`);
  }

  const rawHeaders = allRows[0].map((header) => trimAndNormalizeString(header));
  const normalizedHeaders = normalizeColumnNamesWithDeduplication(rawHeaders);
  const dataRows = allRows.slice(1);

  return dataRows.map((row) => {
    const newRow: DataRow = {};
    normalizedHeaders.forEach((normalizedKey, colIndex) => {
      const rawValue = row[colIndex];

      if (rawValue instanceof Date) {
        newRow[normalizedKey] = convertExcelDateToISOString(rawValue);
      } else {
        newRow[normalizedKey] = trimAndNormalizeString(rawValue);
      }
    });
    return newRow;
  });
}

export async function parseXLSXFirstSheetWithAvailableSheets(
  file: File,
): Promise<ParseXLSXResult> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: true,
    sheetRows: 0, // 0 = lire toutes les lignes sans limite
    bookVBA: true, // Support des macros/VBA
    cellFormula: true, // Support des formules
    cellStyles: true, // Support des styles
  });

  const availableSheetNames = workbook.SheetNames;
  if (availableSheetNames.length === 0) {
    throw new Error('Le fichier XLSX ne contient aucune feuille.');
  }

  const firstSheetName = availableSheetNames[0];
  const data = extractAndNormalizeSheetData(workbook, firstSheetName);

  return { data, availableSheetNames };
}

export async function extractRowsFromSpecificSheet(
  file: File,
  sheetName: string,
): Promise<DataRow[]> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: true,
    sheetRows: 0, // 0 = lire toutes les lignes sans limite
    bookVBA: true, // Support des macros/VBA
    cellFormula: true, // Support des formules
    cellStyles: true, // Support des styles
  });

  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`La feuille "${sheetName}" n'existe pas dans le fichier.`);
  }

  return extractAndNormalizeSheetData(workbook, sheetName);
}
