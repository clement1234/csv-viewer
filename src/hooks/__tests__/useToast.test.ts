import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast.ts';

describe('useToast', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('success', 'Fichier chargé');
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe('success');
    expect(result.current.toasts[0].message).toBe('Fichier chargé');
  });

  it('should remove a toast by id', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'Erreur');
    });
    const toastId = result.current.toasts[0].id;
    act(() => {
      result.current.removeToast(toastId);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should auto-dismiss success toast after default duration', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('success', 'Succès');
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it('should auto-dismiss error toast after 8000ms', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('error', 'Erreur');
    });
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it('should use custom duration when provided', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('info', 'Info', 1000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.toasts).toHaveLength(0);
    vi.useRealTimers();
  });
});
