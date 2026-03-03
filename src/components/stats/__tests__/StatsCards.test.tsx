import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsCards } from '../StatsCards.tsx';
import type { DataRow } from '../../../types/core.types.ts';
import type { StatsCardConfig } from '../../../types/config.types.ts';
import type { FilterState } from '../../../types/ui.types.ts';

const sampleRows: DataRow[] = [
  { nom: 'Dupont', statut: 'actif', age: '30' },
  { nom: 'Martin', statut: 'inactif', age: '25' },
  { nom: 'Durand', statut: 'actif', age: '45' },
  { nom: 'Petit', statut: 'actif', age: '35' },
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

describe('StatsCards', () => {
  it('should display total count card', () => {
    const cards: StatsCardConfig[] = [{ type: 'count', label: 'Total' }];
    render(
      <StatsCards
        cards={cards}
        rows={sampleRows}
        filterState={createEmptyFilterState()}
        onCardClick={noopClick}
      />,
    );
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should display countWhere card with filtered count', () => {
    const cards: StatsCardConfig[] = [
      { type: 'countWhere', label: 'Actifs', column: 'statut', value: 'actif' },
    ];
    render(
      <StatsCards
        cards={cards}
        rows={sampleRows}
        filterState={createEmptyFilterState()}
        onCardClick={noopClick}
      />,
    );
    expect(screen.getByText('Actifs')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display multiple cards', () => {
    const cards: StatsCardConfig[] = [
      { type: 'count', label: 'Total' },
      { type: 'countWhere', label: 'Inactifs', column: 'statut', value: 'inactif' },
    ];
    render(
      <StatsCards
        cards={cards}
        rows={sampleRows}
        filterState={createEmptyFilterState()}
        onCardClick={noopClick}
      />,
    );
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Inactifs')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render nothing when cards array is empty', () => {
    const { container } = render(
      <StatsCards
        cards={[]}
        rows={sampleRows}
        filterState={createEmptyFilterState()}
        onCardClick={noopClick}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should call onCardClick when clicking a countWhere card', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const cards: StatsCardConfig[] = [
      { type: 'countWhere', label: 'Actifs', column: 'statut', value: 'actif' },
    ];
    render(
      <StatsCards
        cards={cards}
        rows={sampleRows}
        filterState={createEmptyFilterState()}
        onCardClick={handleClick}
      />,
    );
    await user.click(screen.getByText('Actifs'));
    expect(handleClick).toHaveBeenCalledWith('statut', 'actif');
  });

  it('should not call onCardClick when clicking a count card', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const cards: StatsCardConfig[] = [{ type: 'count', label: 'Total' }];
    render(
      <StatsCards
        cards={cards}
        rows={sampleRows}
        filterState={createEmptyFilterState()}
        onCardClick={handleClick}
      />,
    );
    await user.click(screen.getByText('Total'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have role="button" only on countWhere cards', () => {
    const cards: StatsCardConfig[] = [
      { type: 'count', label: 'Total' },
      { type: 'countWhere', label: 'Actifs', column: 'statut', value: 'actif' },
    ];
    render(
      <StatsCards
        cards={cards}
        rows={sampleRows}
        filterState={createEmptyFilterState()}
        onCardClick={noopClick}
      />,
    );
    const totalCard = screen.getByText('Total').closest('div[class*="rounded-lg"]');
    const actifsCard = screen.getByText('Actifs').closest('div[class*="rounded-lg"]');
    expect(totalCard).not.toHaveAttribute('role');
    expect(actifsCard).toHaveAttribute('role', 'button');
  });

  it('should highlight active countWhere card', () => {
    const filterState = createEmptyFilterState();
    filterState.categoryFilters = [{ columnName: 'statut', selectedValues: ['actif'] }];
    const cards: StatsCardConfig[] = [
      { type: 'countWhere', label: 'Actifs', column: 'statut', value: 'actif' },
    ];
    render(
      <StatsCards
        cards={cards}
        rows={sampleRows}
        filterState={filterState}
        onCardClick={noopClick}
      />,
    );
    const actifsCard = screen.getByText('Actifs').closest('div[class*="rounded-lg"]');
    expect(actifsCard?.className).toContain('bg-blue-100');
  });
});
