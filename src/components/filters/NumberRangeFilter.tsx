interface NumberRangeFilterProps {
  columnName: string;
  label: string;
  minValue: number | null;
  maxValue: number | null;
  schemaMin?: number;
  schemaMax?: number;
  onChange: (minValue: number | null, maxValue: number | null) => void;
}

export function NumberRangeFilter({
  columnName,
  label,
  minValue,
  maxValue,
  schemaMin,
  schemaMax,
  onChange,
}: NumberRangeFilterProps): React.JSX.Element {
  return (
    <div>
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      <div className="flex gap-2">
        <input
          type="number"
          value={minValue ?? ''}
          placeholder={schemaMin !== undefined ? String(schemaMin) : 'Min'}
          onChange={(event) => {
            const val = event.target.value;
            onChange(val === '' ? null : Number(val), maxValue);
          }}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`${columnName} min`}
        />
        <input
          type="number"
          value={maxValue ?? ''}
          placeholder={schemaMax !== undefined ? String(schemaMax) : 'Max'}
          onChange={(event) => {
            const val = event.target.value;
            onChange(minValue, val === '' ? null : Number(val));
          }}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`${columnName} max`}
        />
      </div>
    </div>
  );
}
