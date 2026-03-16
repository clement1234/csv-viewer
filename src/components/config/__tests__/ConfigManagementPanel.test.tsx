import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigManagementPanel } from '../ConfigManagementPanel';
import type { StoredConfig } from '../../../types/storage.types';

describe('ConfigManagementPanel', () => {
  const mockConfigs: StoredConfig[] = [
    {
      name: 'Config 1',
      config: {
        appBranding: { title: 'Config 1' },
        columns: {},
        filters: [],
        statsCards: [],
      },
      createdAt: '2024-01-01T10:30:00.000Z',
      updatedAt: '2024-01-02T14:45:00.000Z',
    },
    {
      name: 'Config 2',
      config: {
        appBranding: { title: 'Config 2' },
        columns: {},
        filters: [],
        statsCards: [],
      },
      createdAt: '2024-01-03T09:15:00.000Z',
      updatedAt: '2024-01-03T09:15:00.000Z',
    },
  ];

  const mockOnClose = vi.fn();
  const mockOnImport = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnRename = vi.fn();
  const mockOnSelect = vi.fn();

  it('should render modal with title', () => {
    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Gestion des configurations')).toBeInTheDocument();
  });

  it('should show storage info with config count', () => {
    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    // Text is split across elements, so use a more flexible matcher
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/configurations sauvegardées/i)).toBeInTheDocument();
  });

  it('should show singular form for single config', () => {
    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={[mockConfigs[0]]}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    // Text is split across elements
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/configuration sauvegardée/i)).toBeInTheDocument();
  });

  it('should render import button', () => {
    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    expect(
      screen.getByRole('button', { name: /importer une configuration/i })
    ).toBeInTheDocument();
  });

  it('should show empty state when no configs', () => {
    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={[]}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(/aucune configuration sauvegardée/i)).toBeInTheDocument();
  });

  it('should render config list with names and dates', () => {
    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();

    // Check dates are formatted (will appear multiple times, one for each config)
    expect(screen.getAllByText(/Créée:/)).toHaveLength(2);
    expect(screen.getAllByText(/Modifiée:/)).toHaveLength(2);
  });

  it('should highlight selected config', () => {
    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName="Config 1"
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('(Sélectionnée)')).toBeInTheDocument();
  });

  it('should show rename and delete buttons for each config', () => {
    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByLabelText('Renommer Config 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Supprimer Config 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Renommer Config 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Supprimer Config 2')).toBeInTheDocument();
  });

  it('should show delete confirmation dialog', async () => {
    const user = userEvent.setup();

    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    const deleteButton = screen.getByLabelText('Supprimer Config 1');
    await user.click(deleteButton);

    expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
    expect(
      screen.getByText(/êtes-vous sûr de vouloir supprimer/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/cette action est irréversible/i)).toBeInTheDocument();
  });

  it('should call onDelete when delete confirmed', async () => {
    const user = userEvent.setup();

    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    // Open delete confirmation
    const deleteButton = screen.getByLabelText('Supprimer Config 1');
    await user.click(deleteButton);

    // Confirm deletion - get all buttons and find the modal one (not icon button)
    const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
    const confirmButton = deleteButtons.find((btn) => btn.textContent === 'Supprimer');
    if (confirmButton) {
      await user.click(confirmButton);
    }

    expect(mockOnDelete).toHaveBeenCalledWith('Config 1');
  });

  it('should close delete confirmation on cancel', async () => {
    const user = userEvent.setup();

    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    // Open delete confirmation
    const deleteButton = screen.getByLabelText('Supprimer Config 1');
    await user.click(deleteButton);

    expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();

    // Cancel
    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);

    expect(
      screen.queryByText('Confirmer la suppression')
    ).not.toBeInTheDocument();
  });

  it('should show rename dialog with current name', async () => {
    const user = userEvent.setup();

    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    const renameButton = screen.getByLabelText('Renommer Config 1');
    await user.click(renameButton);

    expect(screen.getByText('Renommer la configuration')).toBeInTheDocument();

    const input = screen.getByLabelText('Nouveau nom');
    expect(input).toHaveValue('Config 1');
  });

  it('should allow editing config name in rename dialog', async () => {
    const user = userEvent.setup();

    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    // Open rename dialog
    const renameIconButton = screen.getByLabelText('Renommer Config 1');
    await user.click(renameIconButton);

    // Wait for modal to appear
    expect(screen.getByText('Renommer la configuration')).toBeInTheDocument();

    // Change name using fireEvent for reliability
    const input = screen.getByLabelText('Nouveau nom') as HTMLInputElement;
    expect(input).toHaveValue('Config 1');

    fireEvent.change(input, { target: { value: 'New Config Name' } });

    // Verify input value changed
    expect(input).toHaveValue('New Config Name');
  });

  it('should disable rename button when name is empty', async () => {
    const user = userEvent.setup();

    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    // Open rename dialog
    const renameButton = screen.getByLabelText('Renommer Config 1');
    await user.click(renameButton);

    // Clear name
    const input = screen.getByLabelText('Nouveau nom');
    await user.clear(input);

    // Confirm button should be disabled - get all buttons and find the modal one
    const renameButtons = screen.getAllByRole('button', { name: /renommer/i });
    const confirmButton = renameButtons.find((btn) => btn.textContent === 'Renommer');
    expect(confirmButton).toBeDisabled();
  });

  it('should disable rename button when name unchanged', async () => {
    const user = userEvent.setup();

    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    // Open rename dialog
    const renameButton = screen.getByLabelText('Renommer Config 1');
    await user.click(renameButton);

    // Name is unchanged (still "Config 1") - get all buttons and find the modal one
    const renameButtons = screen.getAllByRole('button', { name: /renommer/i });
    const confirmButton = renameButtons.find((btn) => btn.textContent === 'Renommer');
    expect(confirmButton).toBeDisabled();
  });

  it('should call onSelect when config name clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    // Click on config name
    const configButton = screen.getByText('Config 1').closest('button');
    if (configButton) {
      await user.click(configButton);
    }

    expect(mockOnSelect).toHaveBeenCalledWith('Config 1');
  });

  it('should trigger file input on import button click', async () => {
    const user = userEvent.setup();

    render(
      <ConfigManagementPanel
        isOpen={true}
        onClose={mockOnClose}
        configs={mockConfigs}
        selectedConfigName={null}
        onImport={mockOnImport}
        onDelete={mockOnDelete}
        onRename={mockOnRename}
        onSelect={mockOnSelect}
      />
    );

    // Create a mock file
    const file = new File(['{"test": true}'], 'config.json', {
      type: 'application/json',
    });

    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', '.json');

    // Simulate file selection
    await user.upload(fileInput, file);

    expect(mockOnImport).toHaveBeenCalledWith(file);
  });
});
