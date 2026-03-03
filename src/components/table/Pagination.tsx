import type { PaginationState } from '../../types/ui.types.ts';
import { Button } from '../ui/Button.tsx';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/Icons.tsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: PaginationState['rowsPerPage'];
  totalRows: number;
  onGoToPage: (page: number) => void;
  onSetRowsPerPage: (rowsPerPage: PaginationState['rowsPerPage']) => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

const ROWS_PER_PAGE_OPTIONS: PaginationState['rowsPerPage'][] = [25, 50, 100, 200];

export function Pagination({
  currentPage,
  totalPages,
  rowsPerPage,
  totalRows,
  onGoToPage,
  onSetRowsPerPage,
  isFirstPage,
  isLastPage,
}: PaginationProps): React.JSX.Element {
  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200">
      <span className="text-sm text-gray-600">
        Lignes {startRow}-{endRow} sur {totalRows}
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGoToPage(1)}
          disabled={isFirstPage}
          aria-label="Première page"
        >
          1
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGoToPage(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Page précédente"
        >
          <ChevronLeftIcon size={16} />
        </Button>
        <span className="text-sm text-gray-700 px-2">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGoToPage(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Page suivante"
        >
          <ChevronRightIcon size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGoToPage(totalPages)}
          disabled={isLastPage}
          aria-label="Dernière page"
        >
          {totalPages}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="rows-per-page" className="text-sm text-gray-600">
          Par page :
        </label>
        <select
          id="rows-per-page"
          value={rowsPerPage}
          onChange={(event) => onSetRowsPerPage(Number(event.target.value) as PaginationState['rowsPerPage'])}
          className="text-sm border border-gray-300 rounded-md px-2 py-1"
        >
          {ROWS_PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
