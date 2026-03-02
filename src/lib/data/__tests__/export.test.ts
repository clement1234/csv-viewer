import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportDataRowsToCSVFile } from '../export.ts';
import type { DataRow } from '../../../types/core.types.ts';

describe('exportDataRowsToCSVFile', () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;
  let capturedBlob: Blob | null;

  beforeEach(() => {
    capturedBlob = null;
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    mockRevokeObjectURL = vi.fn();
    mockClick = vi.fn();

    global.URL.createObjectURL = mockCreateObjectURL as typeof URL.createObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL as typeof URL.revokeObjectURL;

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: mockClick,
          style: {},
        } as unknown as HTMLAnchorElement;
      }
      return document.createElement(tag);
    });

    // Capture le Blob passé à createObjectURL
    mockCreateObjectURL.mockImplementation((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    });
  });

  function getExportedContent(): Promise<string> {
    return capturedBlob?.text() ?? Promise.resolve('');
  }

  const testData: DataRow[] = [
    { nom: 'Dupont', prenom: 'Jean', age: '30' },
    { nom: 'Martin', prenom: 'Paul', age: '25' },
  ];

  it('should create a downloadable CSV file', () => {
    exportDataRowsToCSVFile(testData, 'export.csv', ['nom', 'prenom', 'age']);
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should include only visible columns', async () => {
    exportDataRowsToCSVFile(testData, 'export.csv', ['nom', 'age']);
    const content = await getExportedContent();
    expect(content).toContain('nom');
    expect(content).toContain('age');
    expect(content).not.toContain('prenom');
  });

  it('should use column labels when provided', async () => {
    exportDataRowsToCSVFile(testData, 'export.csv', ['nom'], { nom: 'Nom de famille' });
    const content = await getExportedContent();
    expect(content).toContain('Nom de famille');
  });

  it('should escape values containing commas', async () => {
    const data: DataRow[] = [{ description: 'value, with comma' }];
    exportDataRowsToCSVFile(data, 'export.csv', ['description']);
    const content = await getExportedContent();
    expect(content).toContain('"value, with comma"');
  });

  it('should escape values containing double quotes', async () => {
    const data: DataRow[] = [{ description: 'value "with" quotes' }];
    exportDataRowsToCSVFile(data, 'export.csv', ['description']);
    const content = await getExportedContent();
    expect(content).toContain('"value ""with"" quotes"');
  });

  it('should escape values containing newlines', async () => {
    const data: DataRow[] = [{ description: 'line1\nline2' }];
    exportDataRowsToCSVFile(data, 'export.csv', ['description']);
    const content = await getExportedContent();
    expect(content).toContain('"line1\nline2"');
  });

  it('should generate proper CSV structure with headers and rows', async () => {
    exportDataRowsToCSVFile(testData, 'export.csv', ['nom', 'age']);
    const content = await getExportedContent();
    const lines = content.split('\n');
    expect(lines[0]).toBe('nom,age');
    expect(lines[1]).toBe('Dupont,30');
    expect(lines[2]).toBe('Martin,25');
  });

  it('should set correct filename on download link', () => {
    const mockAnchor = { href: '', download: '', click: mockClick, style: {} };
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);
    exportDataRowsToCSVFile(testData, 'my-export.csv', ['nom']);
    expect(mockAnchor.download).toBe('my-export.csv');
  });
});
