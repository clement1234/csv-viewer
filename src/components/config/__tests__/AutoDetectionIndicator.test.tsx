import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutoDetectionIndicator } from '../AutoDetectionIndicator';
import type { ConfigMatchResult } from '../../../types/storage.types';

describe('AutoDetectionIndicator', () => {
  const mockMatchResult: ConfigMatchResult = {
    config: {
      name: 'Test Config',
      config: {
        app: { title: 'Test' },
        columns: {},
        filters: {},
        stats: { cards: [], panels: [] },
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    matchScore: 85,
    matchDetails: {
      headerMatch: 90,
      typeMatch: 80,
      columnCountMatch: true,
    },
  };

  const mockOnToggle = vi.fn();

  it('should not render when matchResult is null', () => {
    const { container } = render(
      <AutoDetectionIndicator
        matchResult={null}
        isEnabled={true}
        onToggle={mockOnToggle}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when config is null', () => {
    const emptyResult: ConfigMatchResult = {
      config: null,
      matchScore: 0,
      matchDetails: {
        headerMatch: 0,
        typeMatch: 0,
        columnCountMatch: false,
      },
    };

    const { container } = render(
      <AutoDetectionIndicator
        matchResult={emptyResult}
        isEnabled={true}
        onToggle={mockOnToggle}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show match score badge', () => {
    render(
      <AutoDetectionIndicator
        matchResult={mockMatchResult}
        isEnabled={true}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText(/auto-détecté: 85%/i)).toBeInTheDocument();
  });

  it('should display tooltip with match details on hover', async () => {
    const user = userEvent.setup();

    render(
      <AutoDetectionIndicator
        matchResult={mockMatchResult}
        isEnabled={true}
        onToggle={mockOnToggle}
      />
    );

    const badge = screen.getByText(/auto-détecté: 85%/i);

    // Hover over badge
    await user.hover(badge);

    // Tooltip should show config name and details
    expect(screen.getByText(/configuration: test config/i)).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument(); // Header match
    expect(screen.getByText('80%')).toBeInTheDocument(); // Type match
    expect(screen.getByText('✓')).toBeInTheDocument(); // Column count match
  });

  it('should hide tooltip when mouse leaves', async () => {
    const user = userEvent.setup();

    render(
      <AutoDetectionIndicator
        matchResult={mockMatchResult}
        isEnabled={true}
        onToggle={mockOnToggle}
      />
    );

    const badge = screen.getByText(/auto-détecté: 85%/i);

    // Hover and unhover
    await user.hover(badge);
    expect(screen.getByText(/configuration: test config/i)).toBeInTheDocument();

    await user.unhover(badge);
    expect(
      screen.queryByText(/configuration: test config/i)
    ).not.toBeInTheDocument();
  });

  it('should show checkmark for column count match', async () => {
    const user = userEvent.setup();

    render(
      <AutoDetectionIndicator
        matchResult={mockMatchResult}
        isEnabled={true}
        onToggle={mockOnToggle}
      />
    );

    const badge = screen.getByText(/auto-détecté: 85%/i);
    await user.hover(badge);

    // Should show ✓ for true columnCountMatch
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should show cross for column count mismatch', async () => {
    const user = userEvent.setup();

    const mismatchResult: ConfigMatchResult = {
      ...mockMatchResult,
      matchDetails: {
        headerMatch: 90,
        typeMatch: 80,
        columnCountMatch: false,
      },
    };

    render(
      <AutoDetectionIndicator
        matchResult={mismatchResult}
        isEnabled={true}
        onToggle={mockOnToggle}
      />
    );

    const badge = screen.getByText(/auto-détecté: 85%/i);
    await user.hover(badge);

    // Should show ✗ for false columnCountMatch
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('should render toggle button as enabled when isEnabled is true', () => {
    render(
      <AutoDetectionIndicator
        matchResult={mockMatchResult}
        isEnabled={true}
        onToggle={mockOnToggle}
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: /désactiver auto-détection/i,
    });

    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('Auto: ON');
    expect(toggleButton).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('should render toggle button as disabled when isEnabled is false', () => {
    render(
      <AutoDetectionIndicator
        matchResult={mockMatchResult}
        isEnabled={false}
        onToggle={mockOnToggle}
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: /activer auto-détection/i,
    });

    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('Auto: OFF');
    expect(toggleButton).toHaveClass('bg-gray-100', 'text-gray-600');
  });

  it('should call onToggle with opposite value when toggle clicked', async () => {
    const user = userEvent.setup();

    render(
      <AutoDetectionIndicator
        matchResult={mockMatchResult}
        isEnabled={true}
        onToggle={mockOnToggle}
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: /désactiver auto-détection/i,
    });

    await user.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });

  it('should call onToggle with true when disabled and clicked', async () => {
    const user = userEvent.setup();

    render(
      <AutoDetectionIndicator
        matchResult={mockMatchResult}
        isEnabled={false}
        onToggle={mockOnToggle}
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: /activer auto-détection/i,
    });

    await user.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });
});
