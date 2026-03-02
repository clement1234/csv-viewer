import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropzone } from '../Dropzone.tsx';

describe('Dropzone', () => {
  it('should render the label text', () => {
    render(<Dropzone onFileSelected={vi.fn()} acceptedFileTypes={['.csv']} label="Mon label" />);
    expect(screen.getByText('Mon label')).toBeInTheDocument();
  });

  it('should display accepted file types', () => {
    render(<Dropzone onFileSelected={vi.fn()} acceptedFileTypes={['.csv', '.xlsx']} />);
    expect(screen.getByText('.csv, .xlsx')).toBeInTheDocument();
  });

  it('should call onFileSelected when a valid file is selected via input', async () => {
    const user = userEvent.setup();
    const handleFile = vi.fn();
    render(<Dropzone onFileSelected={handleFile} acceptedFileTypes={['.csv']} />);
    const input = screen.getByTestId('dropzone-input');
    const file = new File(['content'], 'test.csv', { type: 'text/csv' });
    await user.upload(input, file);
    expect(handleFile).toHaveBeenCalledWith(file);
  });

  it('should show error for invalid file type via drop', () => {
    render(<Dropzone onFileSelected={vi.fn()} acceptedFileTypes={['.csv']} />);
    const dropzone = screen.getByRole('button');
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent(/non supporté/i);
  });

  it('should call onFileSelected when a file is dropped', () => {
    const handleFile = vi.fn();
    render(<Dropzone onFileSelected={handleFile} acceptedFileTypes={['.csv']} />);
    const dropzone = screen.getByRole('button');
    const file = new File(['content'], 'test.csv', { type: 'text/csv' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    expect(handleFile).toHaveBeenCalledWith(file);
  });

  it('should have visual feedback during drag over', () => {
    render(<Dropzone onFileSelected={vi.fn()} acceptedFileTypes={['.csv']} />);
    const dropzone = screen.getByRole('button');
    fireEvent.dragOver(dropzone);
    expect(dropzone.className).toContain('blue');
  });
});
