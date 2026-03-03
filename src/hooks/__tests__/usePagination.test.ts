import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination.ts';

describe('usePagination', () => {
  it('should start at page 1', () => {
    const { result } = renderHook(() => usePagination(100));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.rowsPerPage).toBe(25);
    expect(result.current.totalPages).toBe(4);
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() => usePagination(100));
    act(() => {
      result.current.nextPage();
    });
    expect(result.current.currentPage).toBe(2);
  });

  it('should navigate to previous page', () => {
    const { result } = renderHook(() => usePagination(100));
    act(() => {
      result.current.goToPage(3);
    });
    act(() => {
      result.current.prevPage();
    });
    expect(result.current.currentPage).toBe(2);
  });

  it('should clamp page between 1 and totalPages', () => {
    const { result } = renderHook(() => usePagination(100));
    act(() => {
      result.current.goToPage(0);
    });
    expect(result.current.currentPage).toBe(1);
    act(() => {
      result.current.goToPage(999);
    });
    expect(result.current.currentPage).toBe(4);
  });

  it('should not go below page 1 with prevPage', () => {
    const { result } = renderHook(() => usePagination(100));
    act(() => {
      result.current.prevPage();
    });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.isFirstPage).toBe(true);
  });

  it('should not go above totalPages with nextPage', () => {
    const { result } = renderHook(() => usePagination(100));
    act(() => {
      result.current.goToPage(4);
    });
    act(() => {
      result.current.nextPage();
    });
    expect(result.current.currentPage).toBe(4);
    expect(result.current.isLastPage).toBe(true);
  });

  it('should reset to page 1 when changing rowsPerPage', () => {
    const { result } = renderHook(() => usePagination(100));
    act(() => {
      result.current.goToPage(3);
    });
    act(() => {
      result.current.setRowsPerPage(50);
    });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.rowsPerPage).toBe(50);
    expect(result.current.totalPages).toBe(2);
  });

  it('should handle totalPages of 1 when rows less than rowsPerPage', () => {
    const { result } = renderHook(() => usePagination(10));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(true);
  });
});
