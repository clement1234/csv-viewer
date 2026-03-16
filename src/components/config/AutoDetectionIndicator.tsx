import { useState } from 'react';
import type { ConfigMatchResult } from '../../types/storage.types';

interface AutoDetectionIndicatorProps {
  matchResult: ConfigMatchResult | null;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * Badge affichant le résultat de l'auto-détection avec tooltip de détails
 * Permet d'activer/désactiver l'auto-détection
 */
export function AutoDetectionIndicator({
  matchResult,
  isEnabled,
  onToggle,
}: AutoDetectionIndicatorProps): JSX.Element | null {
  const [showTooltip, setShowTooltip] = useState(false);

  // Ne rien afficher si pas de résultat d'auto-détection
  if (!matchResult || !matchResult.config) {
    return null;
  }

  const { matchScore, matchDetails, config } = matchResult;

  return (
    <div className="relative flex items-center gap-2">
      {/* Badge du score */}
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1.5">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Auto-détecté: {matchScore}%</span>
        </div>

        {/* Tooltip avec détails */}
        {showTooltip && (
          <div className="absolute z-20 top-full mt-2 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
            <div className="space-y-2">
              <div>
                <p className="font-semibold text-white mb-1">
                  Configuration: {config.name}
                </p>
              </div>
              <div className="border-t border-gray-700 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-300">En-têtes:</span>
                  <span className="font-semibold">
                    {matchDetails.headerMatch}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Types:</span>
                  <span className="font-semibold">
                    {matchDetails.typeMatch}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Nb colonnes:</span>
                  <span className="font-semibold">
                    {matchDetails.columnCountMatch ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
            {/* Triangle pointer */}
            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        )}
      </div>

      {/* Toggle auto-détection */}
      <button
        type="button"
        onClick={() => onToggle(!isEnabled)}
        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
          isEnabled
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        aria-label={
          isEnabled
            ? 'Désactiver auto-détection'
            : 'Activer auto-détection'
        }
        title={
          isEnabled
            ? 'Auto-détection activée'
            : 'Auto-détection désactivée'
        }
      >
        {isEnabled ? 'Auto: ON' : 'Auto: OFF'}
      </button>
    </div>
  );
}
