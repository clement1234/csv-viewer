import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigSelector } from '../ConfigSelector';
import type { StoredConfig } from '../../../types/storage.types';

describe('ConfigSelector', () => {
  const mockConfigs: StoredConfig[] = [
    {
      name: 'Config 1',
      config: {
        app: { title: 'Config 1' },
        columns: {},
        filters: {},
        stats: { cards: [], panels: [] },
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      name: 'Config 2',
      config: {
        app: { title: 'Config 2' },
        columns: {},
        filters: {},
        stats: { cards: [], panels: [] },
      },
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      name: 'Config 3',
      config: {
        app: { title: 'Config 3' },
        columns: {},
        filters: {},
        stats: { cards: [], panels: [] },
      },
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
  ];

  const mockOnSelect = vi.fn();
  const mockOnOpenManagement = vi.fn();

  it('should render dropdown button with config count badge', () => {
    render(
      <ConfigSelector
        configs={mockConfigs}
        selectedConfigName={null}
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    const button = screen.getByRole('button', {
      name: /sélectionner une configuration/i,
    });
    expect(button).toBeInTheDocument();

    // Should show count badge
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show selected config name in button', () => {
    render(
      <ConfigSelector
        configs={mockConfigs}
        selectedConfigName="Config 2"
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    expect(screen.getByText('Config 2')).toBeInTheDocument();
  });

  it('should show default text when no config selected', () => {
    render(
      <ConfigSelector
        configs={mockConfigs}
        selectedConfigName={null}
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('should open dropdown on button click', async () => {
    const user = userEvent.setup();

    render(
      <ConfigSelector
        configs={mockConfigs}
        selectedConfigName={null}
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    const button = screen.getByRole('button', {
      name: /sélectionner une configuration/i,
    });

    await user.click(button);

    // All configs should be visible
    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.getByText('Config 3')).toBeInTheDocument();
  });

  it('should highlight selected config with checkmark', async () => {
    const user = userEvent.setup();

    render(
      <ConfigSelector
        configs={mockConfigs}
        selectedConfigName="Config 2"
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    const button = screen.getByRole('button', {
      name: /sélectionner une configuration/i,
    });

    await user.click(button);

    const config2Button = screen.getByRole('button', { name: /Config 2/ });

    // Should have blue background class
    expect(config2Button).toHaveClass('bg-blue-50', 'text-blue-700');

    // Should have checkmark SVG (path with fillRule)
    const checkmark = config2Button.querySelector('svg path[fill-rule]');
    expect(checkmark).toBeInTheDocument();
  });

  it('should call onSelect when config clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfigSelector
        configs={mockConfigs}
        selectedConfigName={null}
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    // Open dropdown
    const dropdownButton = screen.getByRole('button', {
      name: /sélectionner une configuration/i,
    });
    await user.click(dropdownButton);

    // Click on Config 1
    const config1Button = screen.getByRole('button', { name: /Config 1/ });
    await user.click(config1Button);

    expect(mockOnSelect).toHaveBeenCalledWith('Config 1');
  });

  it('should close dropdown after selecting config', async () => {
    const user = userEvent.setup();

    render(
      <ConfigSelector
        configs={mockConfigs}
        selectedConfigName={null}
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    // Open dropdown
    const dropdownButton = screen.getByRole('button', {
      name: /sélectionner une configuration/i,
    });
    await user.click(dropdownButton);

    expect(screen.getByText('Config 1')).toBeInTheDocument();

    // Click on Config 1
    const config1Button = screen.getByRole('button', { name: /Config 1/ });
    await user.click(config1Button);

    // Dropdown should be closed (configs not visible)
    expect(screen.queryByRole('button', { name: /Config 1/ })).not.toBeInTheDocument();
  });

  it('should show "Aucune configuration" when empty', async () => {
    const user = userEvent.setup();

    render(
      <ConfigSelector
        configs={[]}
        selectedConfigName={null}
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    const button = screen.getByRole('button', {
      name: /sélectionner une configuration/i,
    });

    await user.click(button);

    expect(screen.getByText('Aucune configuration')).toBeInTheDocument();
  });

  it('should show management button in dropdown', async () => {
    const user = userEvent.setup();

    render(
      <ConfigSelector
        configs={mockConfigs}
        selectedConfigName={null}
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    const button = screen.getByRole('button', {
      name: /sélectionner une configuration/i,
    });

    await user.click(button);

    const managementButton = screen.getByRole('button', {
      name: /gérer les configurations/i,
    });
    expect(managementButton).toBeInTheDocument();
  });

  it('should call onOpenManagement and close dropdown when management clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfigSelector
        configs={mockConfigs}
        selectedConfigName={null}
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    // Open dropdown
    const dropdownButton = screen.getByRole('button', {
      name: /sélectionner une configuration/i,
    });
    await user.click(dropdownButton);

    // Click management button
    const managementButton = screen.getByRole('button', {
      name: /gérer les configurations/i,
    });
    await user.click(managementButton);

    expect(mockOnOpenManagement).toHaveBeenCalled();

    // Dropdown should be closed
    expect(
      screen.queryByRole('button', { name: /gérer les configurations/i })
    ).not.toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <ConfigSelector
          configs={mockConfigs}
          selectedConfigName={null}
          onSelect={mockOnSelect}
          onOpenManagement={mockOnOpenManagement}
        />
        <div data-testid="outside">Outside</div>
      </div>
    );

    // Open dropdown
    const button = screen.getByRole('button', {
      name: /sélectionner une configuration/i,
    });
    await user.click(button);

    expect(screen.getByText('Config 1')).toBeInTheDocument();

    // Click outside
    const outside = screen.getByTestId('outside');
    await user.click(outside);

    // Dropdown should be closed
    expect(screen.queryByRole('button', { name: /Config 1/ })).not.toBeInTheDocument();
  });

  it('should toggle dropdown on button click', async () => {
    const user = userEvent.setup();

    render(
      <ConfigSelector
        configs={mockConfigs}
        selectedConfigName={null}
        onSelect={mockOnSelect}
        onOpenManagement={mockOnOpenManagement}
      />
    );

    const button = screen.getByRole('button', {
      name: /sélectionner une configuration/i,
    });

    // Open
    await user.click(button);
    expect(screen.getByText('Config 1')).toBeInTheDocument();

    // Close
    await user.click(button);
    expect(screen.queryByRole('button', { name: /Config 1/ })).not.toBeInTheDocument();
  });
});
