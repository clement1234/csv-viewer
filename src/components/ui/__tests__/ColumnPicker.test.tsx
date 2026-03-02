import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnPicker } from '../ColumnPicker.tsx';

const defaultProps = {
  allColumns: ['nom', 'prenom', 'age'],
  visibleColumns: ['nom', 'prenom'],
  onToggleColumn: vi.fn(),
};

describe('ColumnPicker', () => {
  it('should render the toggle button', () => {
    render(<ColumnPicker {...defaultProps} />);
    expect(screen.getByRole('button', { name: /colonnes/i })).toBeInTheDocument();
  });

  it('should show popover with columns when clicked', async () => {
    const user = userEvent.setup();
    render(<ColumnPicker {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /colonnes/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('nom')).toBeInTheDocument();
    expect(screen.getByText('prenom')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
  });

  it('should call onToggleColumn when a column checkbox is clicked', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    render(<ColumnPicker {...defaultProps} onToggleColumn={handleToggle} />);
    await user.click(screen.getByRole('button', { name: /colonnes/i }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'age' }));
    expect(handleToggle).toHaveBeenCalledWith('age');
  });

  it('should use column labels when provided', async () => {
    const user = userEvent.setup();
    render(<ColumnPicker {...defaultProps} columnLabels={{ nom: 'Nom de famille' }} />);
    await user.click(screen.getByRole('button', { name: /colonnes/i }));
    expect(screen.getByText('Nom de famille')).toBeInTheDocument();
  });

  it('should show "Tout sélectionner" button', async () => {
    const user = userEvent.setup();
    render(<ColumnPicker {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /colonnes/i }));
    expect(screen.getByText(/tout sélectionner/i)).toBeInTheDocument();
  });
});
