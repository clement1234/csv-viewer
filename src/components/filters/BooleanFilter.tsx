interface BooleanFilterProps {
  columnName: string;
  label: string;
  selectedValue: 'all' | 'true' | 'false';
  onChange: (value: 'all' | 'true' | 'false') => void;
}

const OPTIONS: { value: 'all' | 'true' | 'false'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'true', label: 'Oui' },
  { value: 'false', label: 'Non' },
];

export function BooleanFilter({
  columnName,
  label,
  selectedValue,
  onChange,
}: BooleanFilterProps): React.JSX.Element {
  return (
    <div>
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      <div className="flex gap-1">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedValue === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label={`${columnName}: ${option.label}`}
            aria-pressed={selectedValue === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
