import { useMemo } from 'react';
import type { DataRow } from '../../types/core.types.ts';
import type { StatsCardConfig } from '../../types/config.types.ts';

interface StatsCardsProps {
  cards: StatsCardConfig[];
  rows: DataRow[];
}

function computeCardValue(card: StatsCardConfig, rows: DataRow[]): number {
  if (card.type === 'count') {
    return rows.length;
  }
  return rows.filter((row) => row[card.column] === card.value).length;
}

export function StatsCards({ cards, rows }: StatsCardsProps): React.JSX.Element | null {
  const computedValues = useMemo(
    () => cards.map((card) => computeCardValue(card, rows)),
    [cards, rows],
  );

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card, cardIndex) => (
        <div
          key={card.label}
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{computedValues[cardIndex]}</p>
        </div>
      ))}
    </div>
  );
}
