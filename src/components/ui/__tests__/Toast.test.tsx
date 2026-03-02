import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '../Toast.tsx';
import type { Toast as ToastData } from '../../../hooks/useToast.ts';

function createToast(overrides?: Partial<ToastData>): ToastData {
  return {
    id: 'toast-1',
    type: 'success',
    message: 'Opération réussie',
    duration: 4000,
    ...overrides,
  };
}

describe('Toast', () => {
  it('should display the toast message', () => {
    render(<Toast toast={createToast()} onClose={vi.fn()} />);
    expect(screen.getByText('Opération réussie')).toBeInTheDocument();
  });

  it('should render an icon', () => {
    render(<Toast toast={createToast()} onClose={vi.fn()} />);
    expect(screen.getByTestId('toast-icon')).toBeInTheDocument();
  });

  it('should call onClose with toast id when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<Toast toast={createToast({ id: 'my-toast' })} onClose={handleClose} />);
    await user.click(screen.getByRole('button', { name: /fermer/i }));
    expect(handleClose).toHaveBeenCalledWith('my-toast');
  });

  it('should apply correct CSS classes for error type', () => {
    render(<Toast toast={createToast({ type: 'error' })} onClose={vi.fn()} />);
    const alertEl = screen.getByRole('alert');
    expect(alertEl.className).toContain('red');
  });

  it('should have role="alert" for accessibility', () => {
    render(<Toast toast={createToast()} onClose={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
