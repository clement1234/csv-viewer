import type { DataRow } from '../../types/core.types.ts';

function escapeCSVCellValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return value;
}

export function exportDataRowsToCSVFile(
  data: DataRow[],
  filename: string,
  visibleColumns: string[],
  columnLabels?: Record<string, string>,
): void {
  const headerRow = visibleColumns
    .map((col) => escapeCSVCellValue(columnLabels?.[col] ?? col))
    .join(',');

  const dataRows = data.map((row) =>
    visibleColumns
      .map((col) => escapeCSVCellValue(row[col] ?? ''))
      .join(','),
  );

  const csvContent = [headerRow, ...dataRows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}
