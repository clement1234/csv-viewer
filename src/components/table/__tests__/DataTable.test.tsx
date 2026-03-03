import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '../DataTable.tsx';
import { createMockInferredSchema } from '../../../test/factories/data.factory.ts';
import type { DataRow } from '../../../types/core.types.ts';
import type { Config } from '../../../types/config.types.ts';
import type { SortState } from '../../../types/ui.types.ts';

const testData: DataRow[] = [
  { nom: 'Dupont', prenom: 'Jean', age: '30' },
  { nom: 'Martin', prenom: 'Paul', age: '25' },
];

const testSchema = [
  createMockInferredSchema({ columnName: 'nom' }),
  createMockInferredSchema({ columnName: 'prenom' }),
  createMockInferredSchema({ columnName: 'age', detectedType: 'number' }),
];

const defaultProps = {
  data: testData,
  visibleColumns: ['nom', 'prenom', 'age'],
  schema: testSchema,
  config: {} as Config,
  sortState: { columnName: null, direction: null } as SortState,
  onSortChange: vi.fn(),
  onRowClick: vi.fn(),
};

describe('DataTable', () => {
  it('should render column headers', () => {
    render(<DataTable {...defaultProps} />);
    expect(screen.getByText('nom')).toBeInTheDocument();
    expect(screen.getByText('prenom')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
  });

  it('should use column labels when provided', () => {
    render(<DataTable {...defaultProps} columnLabels={{ nom: 'Nom de famille' }} />);
    expect(screen.getByText('Nom de famille')).toBeInTheDocument();
  });

  it('should render data rows', () => {
    render(<DataTable {...defaultProps} />);
    expect(screen.getByText('Dupont')).toBeInTheDocument();
    expect(screen.getByText('Martin')).toBeInTheDocument();
  });

  it('should call onSortChange when a header is clicked', async () => {
    const user = userEvent.setup();
    const handleSort = vi.fn();
    render(<DataTable {...defaultProps} onSortChange={handleSort} />);
    await user.click(screen.getByText('nom'));
    expect(handleSort).toHaveBeenCalledWith('nom');
  });

  it('should call onRowClick when a row is clicked', async () => {
    const user = userEvent.setup();
    const handleRowClick = vi.fn();
    render(<DataTable {...defaultProps} onRowClick={handleRowClick} />);
    await user.click(screen.getByText('Dupont'));
    expect(handleRowClick).toHaveBeenCalledWith(testData[0], 0);
  });

  it('should display empty state when no data', () => {
    render(<DataTable {...defaultProps} data={[]} />);
    expect(screen.getByText(/aucune donnée/i)).toBeInTheDocument();
  });

  it('should only render visible columns', () => {
    render(<DataTable {...defaultProps} visibleColumns={['nom']} />);
    expect(screen.getByText('Dupont')).toBeInTheDocument();
    expect(screen.queryByText('Jean')).not.toBeInTheDocument();
  });
});
