import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppState } from '../useAppState.ts';

// Mock des parsers
vi.mock('../../lib/parsers/csv-parser.ts', () => ({
  parseCSVFileToNormalizedRows: vi.fn(),
}));
vi.mock('../../lib/parsers/xlsx-parser.ts', () => ({
  parseXLSXFirstSheetWithAvailableSheets: vi.fn(),
  extractRowsFromSpecificSheet: vi.fn(),
}));

import { parseCSVFileToNormalizedRows } from '../../lib/parsers/csv-parser.ts';
import { parseXLSXFirstSheetWithAvailableSheets } from '../../lib/parsers/xlsx-parser.ts';

const mockCSVParse = vi.mocked(parseCSVFileToNormalizedRows);
const mockXLSXParse = vi.mocked(parseXLSXFirstSheetWithAvailableSheets);

const sampleParsedRows = [
  { nom: 'Dupont', age: '30', actif: 'true' },
  { nom: 'Martin', age: '25', actif: 'false' },
  { nom: 'Durand', age: '45', actif: 'true' },
];

function createMockFile(name: string, type: string): File {
  return new File(['content'], name, { type });
}

describe('useAppState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAppState());
    expect(result.current.parsedData).toEqual([]);
    expect(result.current.inferredSchema).toEqual([]);
    expect(result.current.appliedConfig).toBeNull();
    expect(result.current.selectedRowIndex).toBeNull();
  });

  it('should parse CSV file on data upload', async () => {
    mockCSVParse.mockResolvedValue(sampleParsedRows);
    const { result } = renderHook(() => useAppState());

    await act(async () => {
      await result.current.handleDataFileUpload(createMockFile('data.csv', 'text/csv'));
    });

    expect(mockCSVParse).toHaveBeenCalled();
    expect(result.current.parsedData).toEqual(sampleParsedRows);
    expect(result.current.inferredSchema.length).toBeGreaterThan(0);
  });

  it('should parse XLSX file on data upload', async () => {
    mockXLSXParse.mockResolvedValue({
      data: sampleParsedRows,
      availableSheetNames: ['Feuille1', 'Feuille2'],
    });
    const { result } = renderHook(() => useAppState());

    await act(async () => {
      await result.current.handleDataFileUpload(createMockFile('data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
    });

    expect(mockXLSXParse).toHaveBeenCalled();
    expect(result.current.parsedData).toEqual(sampleParsedRows);
    expect(result.current.availableSheetNames).toEqual(['Feuille1', 'Feuille2']);
  });

  it('should set visible columns from schema after parsing', async () => {
    mockCSVParse.mockResolvedValue(sampleParsedRows);
    const { result } = renderHook(() => useAppState());

    await act(async () => {
      await result.current.handleDataFileUpload(createMockFile('data.csv', 'text/csv'));
    });

    expect(result.current.visibleColumns.length).toBeGreaterThan(0);
  });

  it('should toggle column visibility', async () => {
    mockCSVParse.mockResolvedValue(sampleParsedRows);
    const { result } = renderHook(() => useAppState());

    await act(async () => {
      await result.current.handleDataFileUpload(createMockFile('data.csv', 'text/csv'));
    });

    const initialVisibleCount = result.current.visibleColumns.length;
    const columnToToggle = result.current.visibleColumns[0];

    act(() => {
      result.current.toggleColumnVisibility(columnToToggle);
    });

    expect(result.current.visibleColumns.length).toBe(initialVisibleCount - 1);
    expect(result.current.visibleColumns).not.toContain(columnToToggle);
  });

  it('should select and navigate rows', async () => {
    mockCSVParse.mockResolvedValue(sampleParsedRows);
    const { result } = renderHook(() => useAppState());

    await act(async () => {
      await result.current.handleDataFileUpload(createMockFile('data.csv', 'text/csv'));
    });

    act(() => {
      result.current.selectRow(0);
    });
    expect(result.current.selectedRowIndex).toBe(0);

    act(() => {
      result.current.navigateRow('next');
    });
    expect(result.current.selectedRowIndex).toBe(1);

    act(() => {
      result.current.navigateRow('prev');
    });
    expect(result.current.selectedRowIndex).toBe(0);
  });

  it('should not navigate before first or after last row', async () => {
    mockCSVParse.mockResolvedValue(sampleParsedRows);
    const { result } = renderHook(() => useAppState());

    await act(async () => {
      await result.current.handleDataFileUpload(createMockFile('data.csv', 'text/csv'));
    });

    act(() => {
      result.current.selectRow(0);
    });
    act(() => {
      result.current.navigateRow('prev');
    });
    expect(result.current.selectedRowIndex).toBe(0);

    act(() => {
      result.current.selectRow(2);
    });
    act(() => {
      result.current.navigateRow('next');
    });
    expect(result.current.selectedRowIndex).toBe(2);
  });

  it('should handle config file upload', async () => {
    mockCSVParse.mockResolvedValue(sampleParsedRows);
    const { result } = renderHook(() => useAppState());

    await act(async () => {
      await result.current.handleDataFileUpload(createMockFile('data.csv', 'text/csv'));
    });

    const configContent = JSON.stringify({ app: { title: 'Mon App' } });
    const configFile = new File([configContent], 'config.json', { type: 'application/json' });

    await act(async () => {
      await result.current.handleConfigFileUpload(configFile);
    });

    expect(result.current.appliedConfig?.app?.title).toBe('Mon App');
  });
});
