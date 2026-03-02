import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.tsx';

// Mock des parsers
vi.mock('../lib/parsers/csv-parser.ts', () => ({
  parseCSVFileToNormalizedRows: vi.fn(),
}));
vi.mock('../lib/parsers/xlsx-parser.ts', () => ({
  parseXLSXFirstSheetWithAvailableSheets: vi.fn(),
  extractRowsFromSpecificSheet: vi.fn(),
}));

import { parseCSVFileToNormalizedRows } from '../lib/parsers/csv-parser.ts';
import { parseXLSXFirstSheetWithAvailableSheets } from '../lib/parsers/xlsx-parser.ts';

const mockCSVParse = vi.mocked(parseCSVFileToNormalizedRows);
const mockXLSXParse = vi.mocked(parseXLSXFirstSheetWithAvailableSheets);

const sampleParsedRows = [
  { nom: 'Dupont', age: '30', ville: 'Paris' },
  { nom: 'Martin', age: '25', ville: 'Lyon' },
  { nom: 'Durand', age: '45', ville: 'Paris' },
];

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the upload screen initially', () => {
    render(<App />);
    expect(screen.getByText(/csv\/excel viewer/i)).toBeInTheDocument();
    expect(screen.getByText(/glissez-déposez/i)).toBeInTheDocument();
  });

  it('should show data table after CSV upload', async () => {
    mockCSVParse.mockResolvedValue(sampleParsedRows);
    const user = userEvent.setup();
    render(<App />);

    const csvFile = new File(['nom,age,ville\nDupont,30,Paris'], 'data.csv', { type: 'text/csv' });
    const dropzone = screen.getByText(/glissez-déposez/i).closest('div');
    const fileInput = dropzone?.querySelector('input[type="file"]');

    if (fileInput) {
      await user.upload(fileInput as HTMLInputElement, csvFile);
    }

    // Attendre l'affichage de la table
    expect(await screen.findByText('Dupont')).toBeInTheDocument();
    expect(screen.getByText('Martin')).toBeInTheDocument();
  });

  it('should show XLSX sheet selector when multiple sheets', async () => {
    mockXLSXParse.mockResolvedValue({
      data: sampleParsedRows,
      availableSheetNames: ['Contacts', 'Adresses'],
    });
    const user = userEvent.setup();
    render(<App />);

    const xlsxFile = new File(['content'], 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const dropzone = screen.getByText(/glissez-déposez/i).closest('div');
    const fileInput = dropzone?.querySelector('input[type="file"]');

    if (fileInput) {
      await user.upload(fileInput as HTMLInputElement, xlsxFile);
    }

    expect(await screen.findByText('Dupont')).toBeInTheDocument();
    // Sélecteur de feuille visible car >1 feuille
    expect(screen.getByText('Contacts')).toBeInTheDocument();
  });

  it('should show error toast on invalid file', async () => {
    mockCSVParse.mockRejectedValue(new Error('Fichier invalide'));
    const user = userEvent.setup();
    render(<App />);

    const badFile = new File(['invalid'], 'bad.csv', { type: 'text/csv' });
    const dropzone = screen.getByText(/glissez-déposez/i).closest('div');
    const fileInput = dropzone?.querySelector('input[type="file"]');

    if (fileInput) {
      await user.upload(fileInput as HTMLInputElement, badFile);
    }

    expect(await screen.findByText(/erreur/i)).toBeInTheDocument();
  });

  it('should allow sorting by clicking column headers', async () => {
    mockCSVParse.mockResolvedValue(sampleParsedRows);
    const user = userEvent.setup();
    render(<App />);

    const csvFile = new File(['content'], 'data.csv', { type: 'text/csv' });
    const dropzone = screen.getByText(/glissez-déposez/i).closest('div');
    const fileInput = dropzone?.querySelector('input[type="file"]');

    if (fileInput) {
      await user.upload(fileInput as HTMLInputElement, csvFile);
    }

    await screen.findByText('Dupont');

    // Cliquer sur l'en-tête "nom" pour trier
    const nomHeader = screen.getByText('nom');
    await user.click(nomHeader);

    // Les données devraient être triées, Dupont < Durand < Martin
    const cells = screen.getAllByRole('cell');
    const nomCells = cells.filter((_, index) => index % 3 === 0);
    expect(nomCells[0].textContent).toBe('Dupont');
    expect(nomCells[1].textContent).toBe('Durand');
    expect(nomCells[2].textContent).toBe('Martin');
  });
});
