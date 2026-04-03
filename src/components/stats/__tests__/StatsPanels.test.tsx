import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsPanels } from '../StatsPanels.tsx';
import type { DataRow } from '../../../types/core.types.ts';
import type { StatsPanelConfig } from '../../../types/config.types.ts';
import type { FilterState } from '../../../types/ui.types.ts';

const sampleRows: DataRow[] = [
  { nom: 'Dupont', statut: 'actif', date: '2022-05-10', tags: 'react|node', age: '25' },
  { nom: 'Martin', statut: 'inactif', date: '2023-03-15', tags: 'python', age: '30' },
  { nom: 'Durand', statut: 'actif', date: '2022-11-20', tags: 'react|python', age: '35' },
  { nom: 'Petit', statut: 'actif', date: '2024-01-05', tags: 'node', age: '40' },
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
      { nom: 'Dupont', statut: 'actif', date: '2022-05-10', tags: 'react|node', age: '25' },
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

  it('should display numericStats panel with unit', () => {
    const panels: StatsPanelConfig[] = [
      { type: 'numericStats', column: 'age', label: 'Statistiques d\'âge', unit: 'ans' },
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
    expect(screen.getByText('Statistiques d\'âge')).toBeInTheDocument();
    expect(screen.getByText('Moyenne')).toBeInTheDocument();
    expect(screen.getAllByText('32.5 ans').length).toBeGreaterThan(0); // Moyenne et Q2
    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.getByText('25.0 ans')).toBeInTheDocument();
    expect(screen.getByText('Q4 (100%)')).toBeInTheDocument();
    expect(screen.getByText('40.0 ans')).toBeInTheDocument();
  });

  it('should display numericStats panel without unit', () => {
    const panels: StatsPanelConfig[] = [
      { type: 'numericStats', column: 'age', label: 'Stats' },
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
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getAllByText('32.5').length).toBeGreaterThan(0); // Sans unité, moyenne et Q2
  });

  it('should display message when no numeric data available', () => {
    const rowsWithoutAge: DataRow[] = [
      { nom: 'Dupont', statut: 'actif' },
      { nom: 'Martin', statut: 'inactif' },
    ];
    const panels: StatsPanelConfig[] = [
      { type: 'numericStats', column: 'age', label: 'Stats', unit: 'ans' },
    ];
    render(
      <StatsPanels
        panels={panels}
        allRows={rowsWithoutAge}
        filteredRows={rowsWithoutAge}
        filterState={createEmptyFilterState()}
        onStatValueClick={noopClick}
      />,
    );
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('Aucune donnée numérique disponible')).toBeInTheDocument();
  });

  it('should display all quartiles in numericStats panel', () => {
    const panels: StatsPanelConfig[] = [
      { type: 'numericStats', column: 'age', label: 'Stats' },
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
    expect(screen.getByText('Q1 (25%)')).toBeInTheDocument();
    expect(screen.getByText('Q2 (50%)')).toBeInTheDocument();
    expect(screen.getByText('Q3 (75%)')).toBeInTheDocument();
    expect(screen.getByText('Q4 (100%)')).toBeInTheDocument();
    expect(screen.getByText('Écart-type')).toBeInTheDocument();
    expect(screen.getByText('Nombre de valeurs')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // count
  });
});
