import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../Pagination.tsx';

const defaultProps = {
  currentPage: 2,
  totalPages: 4,
  rowsPerPage: 25 as const,
  totalRows: 100,
  onGoToPage: vi.fn(),
  onSetRowsPerPage: vi.fn(),
  isFirstPage: false,
  isLastPage: false,
};

describe('Pagination', () => {
  it('should display row range and total', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText('Lignes 26-50 sur 100')).toBeInTheDocument();
  });

  it('should display current page and total pages', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText('2 / 4')).toBeInTheDocument();
  });

  it('should call onGoToPage when next button is clicked', async () => {
    const user = userEvent.setup();
    const handleGoToPage = vi.fn();
    render(<Pagination {...defaultProps} onGoToPage={handleGoToPage} />);
    await user.click(screen.getByRole('button', { name: /page suivante/i }));
    expect(handleGoToPage).toHaveBeenCalledWith(3);
  });

  it('should disable previous buttons on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} isFirstPage={true} />);
    expect(screen.getByRole('button', { name: /page précédente/i })).toBeDisabled();
  });

  it('should disable next buttons on last page', () => {
    render(<Pagination {...defaultProps} currentPage={4} isLastPage={true} />);
    expect(screen.getByRole('button', { name: /page suivante/i })).toBeDisabled();
  });

  it('should call onSetRowsPerPage when select changes', async () => {
    const user = userEvent.setup();
    const handleSetRows = vi.fn();
    render(<Pagination {...defaultProps} onSetRowsPerPage={handleSetRows} />);
    await user.selectOptions(screen.getByLabelText(/par page/i), '50');
    expect(handleSetRows).toHaveBeenCalledWith(50);
  });
});
