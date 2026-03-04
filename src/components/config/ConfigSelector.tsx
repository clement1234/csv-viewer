import { useState, useRef, useEffect } from 'react';
import type { StoredConfig } from '../../types/storage.types';

interface ConfigSelectorProps {
  configs: StoredConfig[];
  selectedConfigName: string | null;
  onSelect: (configName: string) => void;
  onOpenManagement: () => void;
}

/**
 * Dropdown pour sélectionner une configuration sauvegardée
 * Affiche la liste des configs avec la config sélectionnée en surbrillance
 */
export function ConfigSelector({
  configs,
  selectedConfigName,
  onSelect,
  onOpenManagement,
}: ConfigSelectorProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect((): (() => void) | undefined => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleConfigClick = (configName: string): void => {
    onSelect(configName);
    setIsOpen(false);
  };

  const selectedConfig = configs.find((c) => c.name === selectedConfigName);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Sélectionner une configuration"
        aria-expanded={isOpen}
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {selectedConfig ? selectedConfig.name : 'Configuration'}
        </span>
        {configs.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
            {configs.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="max-h-80 overflow-y-auto">
            {configs.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Aucune configuration
              </div>
            ) : (
              <ul className="py-1">
                {configs.map((config) => (
                  <li key={config.name}>
                    <button
                      type="button"
                      onClick={() => handleConfigClick(config.name)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        config.name === selectedConfigName
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{config.name}</span>
                      {config.name === selectedConfigName && (
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenManagement();
              }}
              className="w-full px-4 py-2 text-sm text-left text-blue-600 hover:bg-gray-50 transition-colors font-medium"
            >
              Gérer les configurations
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
