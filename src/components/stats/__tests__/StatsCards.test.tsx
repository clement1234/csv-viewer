import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCards } from '../StatsCards.tsx';
import type { DataRow } from '../../../types/core.types.ts';
import type { StatsCardConfig } from '../../../types/config.types.ts';

const sampleRows: DataRow[] = [
  { nom: 'Dupont', statut: 'actif', age: '30' },
  { nom: 'Martin', statut: 'inactif', age: '25' },
  { nom: 'Durand', statut: 'actif', age: '45' },
  { nom: 'Petit', statut: 'actif', age: '35' },
];

describe('StatsCards', () => {
  it('should display total count card', () => {
    const cards: StatsCardConfig[] = [{ type: 'count', label: 'Total' }];
    render(<StatsCards cards={cards} rows={sampleRows} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should display countWhere card with filtered count', () => {
    const cards: StatsCardConfig[] = [
      { type: 'countWhere', label: 'Actifs', column: 'statut', value: 'actif' },
    ];
    render(<StatsCards cards={cards} rows={sampleRows} />);
    expect(screen.getByText('Actifs')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display multiple cards', () => {
    const cards: StatsCardConfig[] = [
      { type: 'count', label: 'Total' },
      { type: 'countWhere', label: 'Inactifs', column: 'statut', value: 'inactif' },
    ];
    render(<StatsCards cards={cards} rows={sampleRows} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Inactifs')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render nothing when cards array is empty', () => {
    const { container } = render(<StatsCards cards={[]} rows={sampleRows} />);
    expect(container.firstChild).toBeNull();
  });
});
