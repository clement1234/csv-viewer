import { useState, useMemo, useCallback } from 'react';
import type { PaginationState } from '../types/ui.types.ts';

interface UsePaginationReturn {
  currentPage: number;
  rowsPerPage: PaginationState['rowsPerPage'];
  totalPages: number;
  goToPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: PaginationState['rowsPerPage']) => void;
  nextPage: () => void;
  prevPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function usePagination(
  totalRows: number,
  initialRowsPerPage: PaginationState['rowsPerPage'] = 25,
): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPageState] = useState<PaginationState['rowsPerPage']>(initialRowsPerPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalRows / rowsPerPage)),
    [totalRows, rowsPerPage],
  );

  const goToPage = useCallback(
    (page: number): void => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  const setRowsPerPage = useCallback(
    (newRowsPerPage: PaginationState['rowsPerPage']): void => {
      setRowsPerPageState(newRowsPerPage);
      setCurrentPage(1);
    },
    [],
  );

  const nextPage = useCallback((): void => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback((): void => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;

  return {
    currentPage,
    rowsPerPage,
    totalPages,
    goToPage,
    setRowsPerPage,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage,
  };
}
