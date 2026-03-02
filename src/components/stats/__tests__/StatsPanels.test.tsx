import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsPanels } from '../StatsPanels.tsx';
import type { DataRow } from '../../../types/core.types.ts';
import type { StatsPanelConfig } from '../../../types/config.types.ts';

const sampleRows: DataRow[] = [
  { nom: 'Dupont', statut: 'actif', date: '2022-05-10', tags: 'react|node' },
  { nom: 'Martin', statut: 'inactif', date: '2023-03-15', tags: 'python' },
  { nom: 'Durand', statut: 'actif', date: '2022-11-20', tags: 'react|python' },
  { nom: 'Petit', statut: 'actif', date: '2024-01-05', tags: 'node' },
];

describe('StatsPanels', () => {
  it('should display countByColumn panel', () => {
    const panels: StatsPanelConfig[] = [
      { type: 'countByColumn', column: 'statut', label: 'Par statut' },
    ];
    render(<StatsPanels panels={panels} rows={sampleRows} />);
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
    render(<StatsPanels panels={panels} rows={sampleRows} />);
    expect(screen.getByText('Par année')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('should display countBySplitValues panel', () => {
    const panels: StatsPanelConfig[] = [
      { type: 'countBySplitValues', column: 'tags', label: 'Par technologie' },
    ];
    render(<StatsPanels panels={panels} rows={sampleRows} />);
    expect(screen.getByText('Par technologie')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('node')).toBeInTheDocument();
    expect(screen.getByText('python')).toBeInTheDocument();
  });

  it('should render nothing when panels array is empty', () => {
    const { container } = render(<StatsPanels panels={[]} rows={sampleRows} />);
    expect(container.firstChild).toBeNull();
  });
});
