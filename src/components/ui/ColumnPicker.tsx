import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { EyeIcon, CheckIcon } from './Icons.tsx';

interface ColumnPickerProps {
  allColumns: string[];
  visibleColumns: string[];
  columnLabels?: Record<string, string>;
  onToggleColumn: (columnName: string) => void;
}

export function ColumnPicker({
  allColumns,
  visibleColumns,
  columnLabels,
  onToggleColumn,
}: ColumnPickerProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent): void => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const visibleSet = useMemo(() => new Set(visibleColumns), [visibleColumns]);
  const allSelected = allColumns.every((col) => visibleSet.has(col));

  const handleToggleAll = useCallback((): void => {
    if (allSelected) {
      // Désélectionner tout sauf le premier (minimum 1)
      for (const col of allColumns.slice(1)) {
        if (visibleSet.has(col)) onToggleColumn(col);
      }
    } else {
      for (const col of allColumns) {
        if (!visibleSet.has(col)) onToggleColumn(col);
      }
    }
  }, [allColumns, allSelected, onToggleColumn, visibleSet]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        aria-label="Sélectionner les colonnes"
      >
        <EyeIcon size={16} />
        <span>Colonnes</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-2"
          role="menu"
        >
          <button
            type="button"
            onClick={handleToggleAll}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium text-gray-700 border-b border-gray-100"
          >
            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
          {allColumns.map((col) => {
            const isVisible = visibleSet.has(col);
            const isLastVisible = isVisible && visibleColumns.length === 1;
            return (
              <button
                key={col}
                type="button"
                role="menuitemcheckbox"
                aria-checked={isVisible}
                disabled={isLastVisible}
                onClick={() => onToggleColumn(col)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                <span className={`w-4 h-4 flex items-center justify-center rounded border ${isVisible ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                  {isVisible && <CheckIcon size={12} />}
                </span>
                <span>{columnLabels?.[col] ?? col}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
