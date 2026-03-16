interface DateRangeFilterProps {
  columnName: string;
  label: string;
  startDate: string | null;
  endDate: string | null;
  includeEmpty?: boolean;
  onChange: (startDate: string | null, endDate: string | null, includeEmpty?: boolean) => void;
}

export function DateRangeFilter({
  columnName,
  label,
  startDate,
  endDate,
  includeEmpty,
  onChange,
}: DateRangeFilterProps): React.JSX.Element {
  return (
    <div>
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      <div className="flex gap-2 mb-2">
        <input
          type="date"
          value={startDate ?? ''}
          onChange={(event) => onChange(event.target.value || null, endDate, includeEmpty)}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`${columnName} date début`}
        />
        <input
          type="date"
          value={endDate ?? ''}
          onChange={(event) => onChange(startDate, event.target.value || null, includeEmpty)}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`${columnName} date fin`}
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={includeEmpty ?? false}
          onChange={(event) => onChange(startDate, endDate, event.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          aria-label={`${columnName} inclure les lignes sans date`}
        />
        <span>Inclure les lignes sans date</span>
      </label>
    </div>
  );
}
