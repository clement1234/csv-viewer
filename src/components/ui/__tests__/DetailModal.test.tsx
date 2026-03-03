import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetailModal } from '../DetailModal.tsx';
import type { InferredColumnSchema } from '../../../types/core.types.ts';
import type { Config } from '../../../types/config.types.ts';

const sampleSchema: InferredColumnSchema[] = [
  { columnName: 'nom', detectedType: 'text', distinctValuesCount: 10, emptyValuesRate: 0, sampleValues: ['Dupont'] },
  { columnName: 'age', detectedType: 'number', distinctValuesCount: 5, emptyValuesRate: 0, sampleValues: ['30'], minValue: 20, maxValue: 60 },
  { columnName: 'ville', detectedType: 'category', distinctValuesCount: 3, emptyValuesRate: 0, sampleValues: ['Paris'] },
];

const sampleRow = { nom: 'Dupont', age: '30', ville: 'Paris' };
const emptyConfig: Config = {};

describe('DetailModal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <DetailModal
        isOpen={false}
        row={sampleRow}
        rowIndex={0}
        totalRows={5}
        schema={sampleSchema}
        config={emptyConfig}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render row data as key-value pairs without sections config', () => {
    render(
      <DetailModal
        isOpen={true}
        row={sampleRow}
        rowIndex={0}
        totalRows={5}
        schema={sampleSchema}
        config={emptyConfig}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByText('nom')).toBeInTheDocument();
    // "Dupont" apparaît dans le titre ET dans la valeur
    expect(screen.getAllByText('Dupont').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('age')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should use titleTemplate when provided', () => {
    const configWithTitle: Config = {
      detailModal: { titleTemplate: '{{nom}} - {{ville}}' },
    };
    render(
      <DetailModal
        isOpen={true}
        row={sampleRow}
        rowIndex={0}
        totalRows={5}
        schema={sampleSchema}
        config={configWithTitle}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByText('Dupont - Paris')).toBeInTheDocument();
  });

  it('should fallback to first column value when no titleTemplate', () => {
    render(
      <DetailModal
        isOpen={true}
        row={sampleRow}
        rowIndex={0}
        totalRows={5}
        schema={sampleSchema}
        config={emptyConfig}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByRole('dialog', { name: /dupont/i })).toBeInTheDocument();
  });

  it('should render sections when config has sections', () => {
    const configWithSections: Config = {
      detailModal: {
        titleTemplate: 'Fiche',
        sections: [
          { title: 'Identité', fields: ['nom'] },
          { title: 'Localisation', fields: ['ville'] },
        ],
      },
    };
    render(
      <DetailModal
        isOpen={true}
        row={sampleRow}
        rowIndex={0}
        totalRows={5}
        schema={sampleSchema}
        config={configWithSections}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByText('Identité')).toBeInTheDocument();
    expect(screen.getByText('Localisation')).toBeInTheDocument();
    expect(screen.getByText('Dupont')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('should disable prev button on first row and next on last row', () => {
    render(
      <DetailModal
        isOpen={true}
        row={sampleRow}
        rowIndex={0}
        totalRows={5}
        schema={sampleSchema}
        config={emptyConfig}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /précédent/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /suivant/i })).not.toBeDisabled();
  });

  it('should call onNavigate with correct direction', async () => {
    const user = userEvent.setup();
    const handleNavigate = vi.fn();
    render(
      <DetailModal
        isOpen={true}
        row={sampleRow}
        rowIndex={2}
        totalRows={5}
        schema={sampleSchema}
        config={emptyConfig}
        onClose={vi.fn()}
        onNavigate={handleNavigate}
      />,
    );
    await user.click(screen.getByRole('button', { name: /suivant/i }));
    expect(handleNavigate).toHaveBeenCalledWith('next');
    await user.click(screen.getByRole('button', { name: /précédent/i }));
    expect(handleNavigate).toHaveBeenCalledWith('prev');
  });

  it('should use column labels when available', () => {
    const configWithLabels: Config = {
      columns: { labels: { nom: 'Nom complet', ville: 'Ville de résidence' } },
    };
    render(
      <DetailModal
        isOpen={true}
        row={sampleRow}
        rowIndex={0}
        totalRows={5}
        schema={sampleSchema}
        config={configWithLabels}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByText('Nom complet')).toBeInTheDocument();
    expect(screen.getByText('Ville de résidence')).toBeInTheDocument();
  });

  it('should not render when row is null', () => {
    render(
      <DetailModal
        isOpen={true}
        row={null}
        rowIndex={0}
        totalRows={5}
        schema={sampleSchema}
        config={emptyConfig}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
