import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal.tsx';

describe('Modal', () => {
  it('should not render when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={vi.fn()}>Contenu</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}>Contenu</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Contenu')).toBeInTheDocument();
  });

  it('should display the title', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Mon titre">Contenu</Modal>);
    expect(screen.getByText('Mon titre')).toBeInTheDocument();
  });

  it('should display the footer', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} footer={<button>Sauvegarder</button>}>
        Contenu
      </Modal>,
    );
    expect(screen.getByText('Sauvegarder')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<Modal isOpen={true} onClose={handleClose} title="Titre">Contenu</Modal>);
    await user.click(screen.getByRole('button', { name: /fermer/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<Modal isOpen={true} onClose={handleClose}>Contenu</Modal>);
    await user.click(screen.getByTestId('modal-backdrop'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<Modal isOpen={true} onClose={handleClose}>Contenu</Modal>);
    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should have aria-modal attribute', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}>Contenu</Modal>);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
