interface DateRangeFilterProps {
  columnName: string;
  label: string;
  startDate: string | null;
  endDate: string | null;
  onChange: (startDate: string | null, endDate: string | null) => void;
}

export function DateRangeFilter({
  columnName,
  label,
  startDate,
  endDate,
  onChange,
}: DateRangeFilterProps): React.JSX.Element {
  return (
    <div>
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      <div className="flex gap-2">
        <input
          type="date"
          value={startDate ?? ''}
          onChange={(event) => onChange(event.target.value || null, endDate)}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`${columnName} date début`}
        />
        <input
          type="date"
          value={endDate ?? ''}
          onChange={(event) => onChange(startDate, event.target.value || null)}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`${columnName} date fin`}
        />
      </div>
    </div>
  );
}
