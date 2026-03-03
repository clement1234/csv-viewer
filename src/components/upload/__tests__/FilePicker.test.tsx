import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilePicker } from '../FilePicker.tsx';

describe('FilePicker', () => {
  it('should render the button with label', () => {
    render(<FilePicker onFileSelected={vi.fn()} acceptedFileTypes={['.csv']} label="Charger" />);
    expect(screen.getByRole('button', { name: 'Charger' })).toBeInTheDocument();
  });

  it('should call onFileSelected when a file is selected', async () => {
    const user = userEvent.setup();
    const handleFile = vi.fn();
    render(<FilePicker onFileSelected={handleFile} acceptedFileTypes={['.csv']} />);
    const input = screen.getByTestId('filepicker-input');
    const file = new File(['content'], 'test.csv', { type: 'text/csv' });
    await user.upload(input, file);
    expect(handleFile).toHaveBeenCalledWith(file);
  });

  it('should display the selected file name', async () => {
    const user = userEvent.setup();
    render(<FilePicker onFileSelected={vi.fn()} acceptedFileTypes={['.csv']} />);
    const input = screen.getByTestId('filepicker-input');
    const file = new File(['content'], 'mon-fichier.csv', { type: 'text/csv' });
    await user.upload(input, file);
    expect(screen.getByText('mon-fichier.csv')).toBeInTheDocument();
  });

  it('should not display file name before selection', () => {
    render(<FilePicker onFileSelected={vi.fn()} acceptedFileTypes={['.csv']} />);
    expect(screen.queryByText(/\.csv$/)).not.toBeInTheDocument();
  });
});
