import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeFilter } from '../DateRangeFilter.tsx';

describe('DateRangeFilter', () => {
  it('should render start and end date inputs', () => {
    render(<DateRangeFilter columnName="date" label="Date" startDate={null} endDate={null} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/date début/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date fin/i)).toBeInTheDocument();
  });

  it('should display current values', () => {
    render(<DateRangeFilter columnName="date" label="Date" startDate="2024-01-01" endDate="2024-12-31" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
  });

  it('should call onChange when start date changes', () => {
    const handleChange = vi.fn();
    render(<DateRangeFilter columnName="date" label="Date" startDate={null} endDate={null} onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText(/date début/i), { target: { value: '2024-01-15' } });
    expect(handleChange).toHaveBeenCalledWith('2024-01-15', null);
  });

  it('should call onChange when end date changes', () => {
    const handleChange = vi.fn();
    render(<DateRangeFilter columnName="date" label="Date" startDate="2024-01-01" endDate={null} onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText(/date fin/i), { target: { value: '2024-12-31' } });
    expect(handleChange).toHaveBeenCalledWith('2024-01-01', '2024-12-31');
  });
});
