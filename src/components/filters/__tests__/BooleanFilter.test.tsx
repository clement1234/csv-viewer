import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BooleanFilter } from '../BooleanFilter.tsx';

describe('BooleanFilter', () => {
  it('should render three toggle buttons', () => {
    render(<BooleanFilter columnName="actif" label="Actif" selectedValue="all" onChange={vi.fn()} />);
    expect(screen.getByText('Tous')).toBeInTheDocument();
    expect(screen.getByText('Oui')).toBeInTheDocument();
    expect(screen.getByText('Non')).toBeInTheDocument();
  });

  it('should highlight active selection', () => {
    render(<BooleanFilter columnName="actif" label="Actif" selectedValue="true" onChange={vi.fn()} />);
    const ouiButton = screen.getByRole('button', { name: /oui/i });
    expect(ouiButton.className).toContain('bg-blue-600');
  });

  it('should call onChange when a button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<BooleanFilter columnName="actif" label="Actif" selectedValue="all" onChange={handleChange} />);
    await user.click(screen.getByText('Oui'));
    expect(handleChange).toHaveBeenCalledWith('true');
  });

  it('should display the label', () => {
    render(<BooleanFilter columnName="actif" label="Est actif" selectedValue="all" onChange={vi.fn()} />);
    expect(screen.getByText('Est actif')).toBeInTheDocument();
  });
});
