import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from '../CategoryFilter.tsx';

describe('CategoryFilter', () => {
  it('should render all options', () => {
    render(<CategoryFilter columnName="statut" label="Statut" options={['actif', 'inactif']} selectedValues={[]} onChange={vi.fn()} />);
    expect(screen.getByText('actif')).toBeInTheDocument();
    expect(screen.getByText('inactif')).toBeInTheDocument();
  });

  it('should show checked state for selected values', () => {
    render(<CategoryFilter columnName="statut" label="Statut" options={['actif', 'inactif']} selectedValues={['actif']} onChange={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox', { name: /^statut: actif$/i });
    expect(checkbox).toBeChecked();
  });

  it('should call onChange when an option is toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<CategoryFilter columnName="statut" label="Statut" options={['actif', 'inactif']} selectedValues={[]} onChange={handleChange} />);
    await user.click(screen.getByRole('checkbox', { name: /^statut: actif$/i }));
    expect(handleChange).toHaveBeenCalledWith(['actif']);
  });

  it('should remove value when unchecking', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<CategoryFilter columnName="statut" label="Statut" options={['actif', 'inactif']} selectedValues={['actif']} onChange={handleChange} />);
    await user.click(screen.getByRole('checkbox', { name: /^statut: actif$/i }));
    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
