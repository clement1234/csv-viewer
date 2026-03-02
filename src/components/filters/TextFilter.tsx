import { useState, useEffect } from 'react';

interface TextFilterProps {
  columnName: string;
  label: string;
  value: string;
  onChange: (searchTerm: string) => void;
}

export function TextFilter({ columnName, label, value, onChange }: TextFilterProps): React.JSX.Element {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);
    return (): void => clearTimeout(timer);
  }, [localValue, value, onChange]);

  return (
    <div>
      <label htmlFor={`filter-text-${columnName}`} className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        id={`filter-text-${columnName}`}
        type="text"
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        placeholder={`Filtrer ${label}...`}
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
