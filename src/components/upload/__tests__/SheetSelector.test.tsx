import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SheetSelector } from '../SheetSelector.tsx';

describe('SheetSelector', () => {
  const sheetNames = ['Feuille1', 'Feuille2', 'Feuille3'];

  it('should display all sheet names as radio options', () => {
    render(<SheetSelector sheetNames={sheetNames} onSheetSelected={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Feuille1')).toBeInTheDocument();
    expect(screen.getByText('Feuille2')).toBeInTheDocument();
    expect(screen.getByText('Feuille3')).toBeInTheDocument();
  });

  it('should have first sheet selected by default', () => {
    render(<SheetSelector sheetNames={sheetNames} onSheetSelected={vi.fn()} onCancel={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeChecked();
  });

  it('should call onSheetSelected with selected sheet when Charger is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<SheetSelector sheetNames={sheetNames} onSheetSelected={handleSelect} onCancel={vi.fn()} />);
    await user.click(screen.getByText('Feuille2'));
    await user.click(screen.getByRole('button', { name: 'Charger' }));
    expect(handleSelect).toHaveBeenCalledWith('Feuille2');
  });

  it('should call onCancel when Annuler is clicked', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    render(<SheetSelector sheetNames={sheetNames} onSheetSelected={vi.fn()} onCancel={handleCancel} />);
    await user.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('should display the count of available sheets', () => {
    render(<SheetSelector sheetNames={sheetNames} onSheetSelected={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(/3 feuilles/)).toBeInTheDocument();
  });
});
