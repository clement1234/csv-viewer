import { Modal } from './Modal.tsx';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.tsx';
import { formatCellValueForDisplay } from '../../lib/utils/cell-formatters.ts';
import type { DataRow, InferredColumnSchema } from '../../types/core.types.ts';
import type { Config } from '../../types/config.types.ts';
import type { FormattedCellValue } from '../../lib/utils/cell-formatters.ts';

interface DetailModalProps {
  isOpen: boolean;
  row: DataRow | null;
  rowIndex: number;
  totalRows: number;
  schema: InferredColumnSchema[];
  config: Config;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

function resolveTitleFromTemplate(template: string, row: DataRow): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, columnName: string) => row[columnName] ?? '');
}

function resolveDetailModalTitle(row: DataRow, config: Config): string {
  if (config.detailModal?.titleTemplate) {
    return resolveTitleFromTemplate(config.detailModal.titleTemplate, row);
  }
  // Fallback: valeur de la première colonne
  const firstKey = Object.keys(row)[0];
  return firstKey ? row[firstKey] : 'Détail';
}

function getColumnLabel(columnName: string, config: Config): string {
  return config.columns?.labels?.[columnName] ?? columnName;
}

function FormattedValue({ formatted }: { formatted: FormattedCellValue }): React.JSX.Element {
  switch (formatted.type) {
    case 'badge':
      return (
        <span
          className="inline-block px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: formatted.color, color: 'white' }}
        >
          {formatted.value}
        </span>
      );
    case 'chips':
      return (
        <span className="flex flex-wrap gap-1">
          {formatted.values.map((chip, chipIndex) => (
            <span key={chipIndex} className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs">
              {chip}
            </span>
          ))}
        </span>
      );
    case 'link':
      return (
        <a href={formatted.href} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">
          {formatted.value}
        </a>
      );
    case 'date':
      return <span>{formatted.value}</span>;
    default:
      return <span>{formatted.value}</span>;
  }
}

function FieldRow({
  columnName,
  value,
  config,
  schema,
}: {
  columnName: string;
  value: string;
  config: Config;
  schema: InferredColumnSchema[];
}): React.JSX.Element {
  const label = getColumnLabel(columnName, config);
  const formatted = formatCellValueForDisplay(value, columnName, config, schema);

  return (
    <div className="flex py-2 border-b border-gray-100 last:border-b-0">
      <dt className="w-1/3 text-sm font-medium text-gray-500 shrink-0">{label}</dt>
      <dd className="flex-1 text-sm text-gray-900">
        <FormattedValue formatted={formatted} />
      </dd>
    </div>
  );
}

export function DetailModal({
  isOpen,
  row,
  rowIndex,
  totalRows,
  schema,
  config,
  onClose,
  onNavigate,
}: DetailModalProps): React.JSX.Element | null {
  if (!row) return null;

  const title = resolveDetailModalTitle(row, config);
  const sections = config.detailModal?.sections;
  const isFirstRow = rowIndex === 0;
  const isLastRow = rowIndex === totalRows - 1;

  const navigationFooter = (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">
        {rowIndex + 1} / {totalRows}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onNavigate('prev')}
          disabled={isFirstRow}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Précédent"
        >
          <ChevronLeftIcon size={16} />
          Préc.
        </button>
        <button
          type="button"
          onClick={() => onNavigate('next')}
          disabled={isLastRow}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Suivant"
        >
          Suiv.
          <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={navigationFooter} size="lg">
      {sections ? (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">{section.title}</h3>
              <dl>
                {section.fields.map((fieldName) => (
                  <FieldRow
                    key={fieldName}
                    columnName={fieldName}
                    value={row[fieldName] ?? ''}
                    config={config}
                    schema={schema}
                  />
                ))}
              </dl>
            </div>
          ))}
        </div>
      ) : (
        <dl>
          {Object.entries(row).map(([columnName, value]) => (
            <FieldRow
              key={columnName}
              columnName={columnName}
              value={value}
              config={config}
              schema={schema}
            />
          ))}
        </dl>
      )}
    </Modal>
  );
}
