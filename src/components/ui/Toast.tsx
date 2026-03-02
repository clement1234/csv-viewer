import type { Toast as ToastData } from '../../hooks/useToast.ts';
import { CheckIcon, CloseIcon, AlertIcon, InfoIcon } from './Icons.tsx';

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const TOAST_STYLES: Record<ToastData['type'], string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-orange-50 border-orange-400 text-orange-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
};

const TOAST_ICONS: Record<ToastData['type'], React.JSX.Element> = {
  success: <CheckIcon size={18} />,
  error: <AlertIcon size={18} />,
  warning: <AlertIcon size={18} />,
  info: <InfoIcon size={18} />,
};

export function Toast({ toast, onClose }: ToastProps): React.JSX.Element {
  return (
    <div
      role="alert"
      className={`flex items-center gap-2 px-4 py-3 border rounded-lg shadow-md ${TOAST_STYLES[toast.type]}`}
    >
      <span className="shrink-0" data-testid="toast-icon">{TOAST_ICONS[toast.type]}</span>
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Fermer la notification"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
