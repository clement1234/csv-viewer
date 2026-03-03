import { useState } from 'react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';

interface SheetSelectorProps {
  sheetNames: string[];
  onSheetSelected: (name: string) => void;
  onCancel: () => void;
}

export function SheetSelector({
  sheetNames,
  onSheetSelected,
  onCancel,
}: SheetSelectorProps): React.JSX.Element {
  const [selectedSheet, setSelectedSheet] = useState(sheetNames[0] ?? '');

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Sélectionner une feuille"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            onClick={() => onSheetSelected(selectedSheet)}
            disabled={!selectedSheet}
          >
            Charger
          </Button>
        </div>
      }
    >
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-3">
          Ce fichier contient {sheetNames.length} feuilles. Choisissez celle à charger :
        </legend>
        <div className="space-y-2">
          {sheetNames.map((name) => (
            <label
              key={name}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedSheet === name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="sheet"
                value={name}
                checked={selectedSheet === name}
                onChange={() => setSelectedSheet(name)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-800">{name}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </Modal>
  );
}
