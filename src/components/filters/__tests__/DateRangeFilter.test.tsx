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
    expect(handleChange).toHaveBeenCalledWith('2024-01-15', null, undefined);
  });

  it('should call onChange when end date changes', () => {
    const handleChange = vi.fn();
    render(<DateRangeFilter columnName="date" label="Date" startDate="2024-01-01" endDate={null} onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText(/date fin/i), { target: { value: '2024-12-31' } });
    expect(handleChange).toHaveBeenCalledWith('2024-01-01', '2024-12-31', undefined);
  });

  it('should render includeEmpty checkbox', () => {
    render(<DateRangeFilter columnName="date" label="Date" startDate={null} endDate={null} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/inclure les lignes sans date/i)).toBeInTheDocument();
  });

  it('should display checked state for includeEmpty', () => {
    render(<DateRangeFilter columnName="date" label="Date" startDate={null} endDate={null} includeEmpty={true} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/inclure les lignes sans date/i)).toBeChecked();
  });

  it('should call onChange when includeEmpty checkbox is toggled', () => {
    const handleChange = vi.fn();
    render(<DateRangeFilter columnName="date" label="Date" startDate="2024-01-01" endDate="2024-12-31" includeEmpty={false} onChange={handleChange} />);
    fireEvent.click(screen.getByLabelText(/inclure les lignes sans date/i));
    expect(handleChange).toHaveBeenCalledWith('2024-01-01', '2024-12-31', true);
  });

  it('should preserve includeEmpty when changing dates', () => {
    const handleChange = vi.fn();
    render(<DateRangeFilter columnName="date" label="Date" startDate="2024-01-01" endDate={null} includeEmpty={true} onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText(/date fin/i), { target: { value: '2024-12-31' } });
    expect(handleChange).toHaveBeenCalledWith('2024-01-01', '2024-12-31', true);
  });
});
