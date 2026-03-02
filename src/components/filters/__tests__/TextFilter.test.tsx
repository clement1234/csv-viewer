import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TextFilter } from '../TextFilter.tsx';

describe('TextFilter', () => {
  it('should render with label', () => {
    render(<TextFilter columnName="nom" label="Nom" value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Nom')).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<TextFilter columnName="nom" label="Nom" value="Dupont" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument();
  });

  it('should call onChange after debounce', () => {
    vi.useFakeTimers();
    const handleChange = vi.fn();
    render(<TextFilter columnName="nom" label="Nom" value="" onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'test' } });
    expect(handleChange).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(300); });
    expect(handleChange).toHaveBeenCalledWith('test');
    vi.useRealTimers();
  });

  it('should have placeholder text', () => {
    render(<TextFilter columnName="nom" label="Nom" value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText(/filtrer nom/i)).toBeInTheDocument();
  });
});
