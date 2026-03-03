import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberRangeFilter } from '../NumberRangeFilter.tsx';

describe('NumberRangeFilter', () => {
  it('should render min and max inputs', () => {
    render(<NumberRangeFilter columnName="age" label="Age" minValue={null} maxValue={null} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/age min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age max/i)).toBeInTheDocument();
  });

  it('should display current values', () => {
    render(<NumberRangeFilter columnName="age" label="Age" minValue={18} maxValue={65} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('18')).toBeInTheDocument();
    expect(screen.getByDisplayValue('65')).toBeInTheDocument();
  });

  it('should call onChange when min changes', () => {
    const handleChange = vi.fn();
    render(<NumberRangeFilter columnName="age" label="Age" minValue={null} maxValue={null} onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText(/age min/i), { target: { value: '20' } });
    expect(handleChange).toHaveBeenCalledWith(20, null);
  });

  it('should call onChange with null when input is cleared', () => {
    const handleChange = vi.fn();
    render(<NumberRangeFilter columnName="age" label="Age" minValue={20} maxValue={null} onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText(/age min/i), { target: { value: '' } });
    expect(handleChange).toHaveBeenCalledWith(null, null);
  });
});
