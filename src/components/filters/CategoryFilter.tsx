import { useState, useMemo } from 'react';

interface CategoryFilterProps {
  columnName: string;
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
}

export function CategoryFilter({
  columnName,
  label,
  options,
  selectedValues,
  onChange,
}: CategoryFilterProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [options, searchTerm],
  );

  const handleToggle = (option: string): void => {
    if (selectedSet.has(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div>
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      {options.length > 5 && (
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Rechercher..."
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded mb-1"
          aria-label={`Rechercher dans ${label}`}
        />
      )}
      <div className="max-h-40 overflow-y-auto space-y-1">
        {filteredOptions.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-1 rounded">
            <input
              type="checkbox"
              checked={selectedSet.has(option)}
              onChange={() => handleToggle(option)}
              aria-label={`${columnName}: ${option}`}
            />
            <span className="truncate">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
