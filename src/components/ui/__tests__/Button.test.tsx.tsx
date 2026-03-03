import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button.tsx';

describe('Button', () => {
  it('should render children text', () => {
    render(<Button>Cliquer</Button>);
    expect(screen.getByRole('button', { name: 'Cliquer' })).toBeInTheDocument();
  });

  it('should call onClick handler', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Action</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Désactivé</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be disabled when isLoading is true', () => {
    render(<Button isLoading>Chargement</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show spinner when isLoading', () => {
    render(<Button isLoading>Chargement</Button>);
    const svg = screen.getByRole('button').querySelector('svg.animate-spin');
    expect(svg).toBeInTheDocument();
  });

  it('should render left icon', () => {
    render(<Button leftIcon={<span data-testid="left-icon">L</span>}>Bouton</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('should apply variant classes', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button').className).toContain('border');
  });
});
