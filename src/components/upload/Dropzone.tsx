import { useState, useCallback, useRef } from 'react';
import { UploadIcon } from '../ui/Icons.tsx';

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  acceptedFileTypes: string[];
  label?: string;
}

export function Dropzone({
  onFileSelected,
  acceptedFileTypes,
  label = 'Glissez un fichier ici ou cliquez pour sélectionner',
}: DropzoneProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAcceptedFile = useCallback(
    (file: File): boolean => {
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return acceptedFileTypes.some(
        (type) => type === extension || file.type === type,
      );
    },
    [acceptedFileTypes],
  );

  const handleFile = useCallback(
    (file: File): void => {
      if (isAcceptedFile(file)) {
        setErrorMessage(null);
        onFileSelected(file);
      } else {
        setErrorMessage(`Type de fichier non supporté. Formats acceptés : ${acceptedFileTypes.join(', ')}`);
      }
    },
    [isAcceptedFile, onFileSelected, acceptedFileTypes],
  );

  const handleDragOver = useCallback((event: React.DragEvent): void => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent): void => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent): void => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleClick = useCallback((): void => {
    inputRef.current?.click();
  }, []);

  const borderColor = errorMessage
    ? 'border-red-400 bg-red-50'
    : isDragging
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-300 bg-white hover:border-gray-400';

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${borderColor}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event): void => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFileTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        data-testid="dropzone-input"
      />
      <UploadIcon className="mx-auto text-gray-400 mb-3" size={40} />
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xs text-gray-400 mt-1">
        {acceptedFileTypes.join(', ')}
      </p>
      {errorMessage && (
        <p className="text-sm text-red-600 mt-2" role="alert">{errorMessage}</p>
      )}
    </div>
  );
}
