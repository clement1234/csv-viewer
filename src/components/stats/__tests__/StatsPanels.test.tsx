import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsPanels } from '../StatsPanels.tsx';
import type { DataRow } from '../../../types/core.types.ts';
import type { StatsPanelConfig } from '../../../types/config.types.ts';
import type { FilterState } from '../../../types/ui.types.ts';

const sampleRows: DataRow[] = [
  { nom: 'Dupont', statut: 'actif', date: '2022-05-10', tags: 'react|node' },
  { nom: 'Martin', statut: 'inactif', date: '2023-03-15', tags: 'python' },
  { nom: 'Durand', statut: 'actif', date: '2022-11-20', tags: 'react|python' },
  { nom: 'Petit', statut: 'actif', date: '2024-01-05', tags: 'node' },
];

function createEmptyFilterState(): FilterState {
  return {
    textFilters: [],
    categoryFilters: [],
    dateRangeFilters: [],
    numberRangeFilters: [],
    booleanFilters: [],
    multiSelectFilters: [],
  };
}

const noopClick = vi.fn();

describe('StatsPanels', () => {
  it('should display countByColumn panel', () => {
    const panels: StatsPanelConfig[] = [
      { type: 'countByColumn', column: 'statut', label: 'Par statut' },
    ];
    render(
      <StatsPanels
        panels={panels}
        allRows={sampleRows}
        filteredRows={sampleRows}
        filterState={createEmptyFilterState()}
        onStatValueClick={noopClick}
      />,
    );
    expect(screen.getByText('Par statut')).toBeInTheDocument();
    expect(screen.getByText('actif')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('inactif')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display countByYearFromDate panel', () => {
    const panels: StatsPanelConfig[] = [
      { type: 'countByYearFromDate', column: 'date', label: 'Par année' },
    ];
    render(
      <StatsPanels
        panels={panels}
        allRows={sampleRows}
        filteredRows={sampleRows}
        filterState={createEmptyFilterState()}
        onStatValueClick={noopClick}
      />,
    );
    expect(screen.getByText('Par année')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('should display countBySplitValues panel', () => {
    const panels: StatsPanelConfig[] = [
      { type: 'countBySplitValues', column: 'tags', label: 'Par technologie' },
    ];
    render(
      <StatsPanels
        panels={panels}
        allRows={sampleRows}
        filteredRows={sampleRows}
        filterState={createEmptyFilterState()}
        onStatValueClick={noopClick}
      />,
    );
    expect(screen.getByText('Par technologie')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('node')).toBeInTheDocument();
    expect(screen.getByText('python')).toBeInTheDocument();
  });

  it('should render nothing when panels array is empty', () => {
    const { container } = render(
      <StatsPanels
        panels={[]}
        allRows={sampleRows}
        filteredRows={sampleRows}
        filterState={createEmptyFilterState()}
        onStatValueClick={noopClick}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should call onStatValueClick when a row is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const panels: StatsPanelConfig[] = [
      { type: 'countByColumn', column: 'statut', label: 'Par statut' },
    ];
    render(
      <StatsPanels
        panels={panels}
        allRows={sampleRows}
        filteredRows={sampleRows}
        filterState={createEmptyFilterState()}
        onStatValueClick={handleClick}
      />,
    );
    await user.click(screen.getByText('actif'));
    expect(handleClick).toHaveBeenCalledWith('countByColumn', 'statut', 'actif');
  });

  it('should call onStatValueClick when pressing Enter on a row', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const panels: StatsPanelConfig[] = [
      { type: 'countByColumn', column: 'statut', label: 'Par statut' },
    ];
    render(
      <StatsPanels
        panels={panels}
        allRows={sampleRows}
        filteredRows={sampleRows}
        filterState={createEmptyFilterState()}
        onStatValueClick={handleClick}
      />,
    );
    const actifRow = screen.getByText('actif').closest('tr');
    actifRow?.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledWith('countByColumn', 'statut', 'actif');
  });

  it('should highlight active filter values', () => {
    const filterState = createEmptyFilterState();
    filterState.categoryFilters = [{ columnName: 'statut', selectedValues: ['actif'] }];
    const panels: StatsPanelConfig[] = [
      { type: 'countByColumn', column: 'statut', label: 'Par statut' },
    ];
    render(
      <StatsPanels
        panels={panels}
        allRows={sampleRows}
        filteredRows={sampleRows}
        filterState={filterState}
        onStatValueClick={noopClick}
      />,
    );
    const actifRow = screen.getByText('actif').closest('tr');
    expect(actifRow?.className).toContain('bg-blue-100');

    const inactifRow = screen.getByText('inactif').closest('tr');
    expect(inactifRow?.className).not.toContain('bg-blue-100');
  });

  it('should have role="button" and tabIndex on rows', () => {
    const panels: StatsPanelConfig[] = [
      { type: 'countByColumn', column: 'statut', label: 'Par statut' },
    ];
    render(
      <StatsPanels
        panels={panels}
        allRows={sampleRows}
        filteredRows={sampleRows}
        filterState={createEmptyFilterState()}
        onStatValueClick={noopClick}
      />,
    );
    const actifRow = screen.getByText('actif').closest('tr');
    expect(actifRow).toHaveAttribute('role', 'button');
    expect(actifRow).toHaveAttribute('tabindex', '0');
  });

  it('should display "-" for values not in filtered data', () => {
    const filteredRows: DataRow[] = [
      { nom: 'Dupont', statut: 'actif', date: '2022-05-10', tags: 'react|node' },
    ];
    const panels: StatsPanelConfig[] = [
      { type: 'countByColumn', column: 'statut', label: 'Par statut' },
    ];
    render(
      <StatsPanels
        panels={panels}
        allRows={sampleRows}
        filteredRows={filteredRows}
        filterState={createEmptyFilterState()}
        onStatValueClick={noopClick}
      />,
    );
    expect(screen.getByText('Par statut')).toBeInTheDocument();
    expect(screen.getByText('actif')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('inactif')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
