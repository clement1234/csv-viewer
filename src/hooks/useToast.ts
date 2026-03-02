import { useState, useCallback, useEffect, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  error: 8000,
  warning: 8000,
};

interface UseToastReturn {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string): void => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration?: number): void => {
      const toastDuration = duration ?? DEFAULT_DURATIONS[type];
      const id = crypto.randomUUID();
      const newToast: Toast = { id, type, message, duration: toastDuration };

      setToasts((previous) => [...previous, newToast]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, toastDuration);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  // Nettoyer les timers au démontage
  useEffect(() => {
    const currentTimers = timersRef.current;
    return (): void => {
      for (const timer of currentTimers.values()) {
        clearTimeout(timer);
      }
      currentTimers.clear();
    };
  }, []);

  return { toasts, addToast, removeToast };
}
