import { useRef, useState, useCallback } from 'react';
import { Button } from '../ui/Button.tsx';

interface FilePickerProps {
  onFileSelected: (file: File) => void;
  acceptedFileTypes: string[];
  label?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export function FilePicker({
  onFileSelected,
  acceptedFileTypes,
  label = 'Choisir un fichier',
  buttonVariant = 'outline',
}: FilePickerProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFileName(file.name);
        onFileSelected(file);
      }
    },
    [onFileSelected],
  );

  const handleClick = useCallback((): void => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFileTypes.join(',')}
        onChange={handleChange}
        className="hidden"
        data-testid="filepicker-input"
      />
      <Button variant={buttonVariant} onClick={handleClick}>
        {label}
      </Button>
      {selectedFileName && (
        <span className="text-sm text-gray-600 truncate max-w-xs">{selectedFileName}</span>
      )}
    </div>
  );
}
