import React, { useState } from 'react';
import type { StoredConfig } from '../../types/storage.types';
import { Modal } from '../ui/Modal';

interface ConfigManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  configs: StoredConfig[];
  selectedConfigName: string | null;
  onImport: (file: File) => void;
  onDelete: (configName: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onSelect: (configName: string) => void;
}

/**
 * Modal de gestion des configurations
 * Permet d'importer, renommer, dupliquer, supprimer des configurations
 */
export function ConfigManagementPanel({
  isOpen,
  onClose,
  configs,
  selectedConfigName,
  onImport,
  onDelete,
  onRename,
  onSelect,
}: ConfigManagementPanelProps): React.JSX.Element {
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const [configToRename, setConfigToRename] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [importFileInput, setImportFileInput] = useState<HTMLInputElement | null>(null);

  const handleImportClick = (): void => {
    importFileInput?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input to allow re-selecting the same file
      event.target.value = '';
    }
  };

  const handleDeleteClick = (configName: string): void => {
    setConfigToDelete(configName);
  };

  const handleDeleteConfirm = (): void => {
    if (configToDelete) {
      onDelete(configToDelete);
      setConfigToDelete(null);
    }
  };

  const handleRenameClick = (configName: string): void => {
    setConfigToRename(configName);
    setNewName(configName);
  };

  const handleRenameConfirm = (): void => {
    if (configToRename && newName.trim() && newName !== configToRename) {
      onRename(configToRename, newName.trim());
      setConfigToRename(null);
      setNewName('');
    }
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Gestion des configurations">
        <div className="space-y-4">
          {/* Storage info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{configs.length}</span>{' '}
              configuration{configs.length > 1 ? 's' : ''} sauvegardée{configs.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Import button */}
          <div>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
              ref={(el) => setImportFileInput(el)}
            />
            <button
              type="button"
              onClick={handleImportClick}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Importer une configuration
            </button>
          </div>

          {/* Config list */}
          {configs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Aucune configuration sauvegardée</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {configs.map((config) => (
                <div
                  key={config.name}
                  className={`border rounded-lg p-3 ${
                    config.name === selectedConfigName
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => onSelect(config.name)}
                        className="text-left w-full"
                      >
                        <h3 className="font-semibold text-gray-900">
                          {config.name}
                          {config.name === selectedConfigName && (
                            <span className="ml-2 text-xs text-blue-600">
                              (Sélectionnée)
                            </span>
                          )}
                        </h3>
                      </button>
                      <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                        <p>Créée: {formatDate(config.createdAt)}</p>
                        <p>Modifiée: {formatDate(config.updatedAt)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-3">
                      <button
                        type="button"
                        onClick={() => handleRenameClick(config.name)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        aria-label={`Renommer ${config.name}`}
                        title="Renommer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(config.name)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label={`Supprimer ${config.name}`}
                        title="Supprimer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete confirmation dialog */}
      {configToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setConfigToDelete(null)}
          title="Confirmer la suppression"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Êtes-vous sûr de vouloir supprimer la configuration{' '}
              <span className="font-semibold">{configToDelete}</span> ?
            </p>
            <p className="text-sm text-gray-600">
              Cette action est irréversible.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfigToDelete(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rename dialog */}
      {configToRename && (
        <Modal
          isOpen={true}
          onClose={() => {
            setConfigToRename(null);
            setNewName('');
          }}
          title="Renommer la configuration"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="config-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nouveau nom
              </label>
              <input
                id="config-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de la configuration"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setConfigToRename(null);
                  setNewName('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleRenameConfirm}
                disabled={!newName.trim() || newName === configToRename}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Renommer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
