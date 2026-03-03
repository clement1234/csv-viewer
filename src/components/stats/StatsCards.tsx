import { useMemo, useCallback } from 'react';
import type { DataRow } from '../../types/core.types.ts';
import type { StatsCardConfig } from '../../types/config.types.ts';
import type { FilterState } from '../../types/ui.types.ts';
import { isStatValueActiveInFilters } from '../../lib/data/stats-filter-mapping.ts';

interface StatsCardsProps {
  cards: StatsCardConfig[];
  rows: DataRow[];
  filterState: FilterState;
  onCardClick: (column: string, value: string) => void;
}

function computeCardValue(card: StatsCardConfig, rows: DataRow[]): number {
  if (card.type === 'count') {
    return rows.length;
  }
  return rows.filter((row) => row[card.column] === card.value).length;
}

export function StatsCards({ cards, rows, filterState, onCardClick }: StatsCardsProps): React.JSX.Element | null {
  const computedValues = useMemo(
    () => cards.map((card) => computeCardValue(card, rows)),
    [cards, rows],
  );

  const handleCardKeyDown = useCallback((event: React.KeyboardEvent, column: string, value: string): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCardClick(column, value);
    }
  }, [onCardClick]);

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card, cardIndex) => {
        const isClickable = card.type === 'countWhere';
        const isActive = isClickable
          && isStatValueActiveInFilters('countByColumn', card.column, card.value, filterState);

        return (
          <div
            key={card.label}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={isClickable ? (): void => onCardClick(card.column, card.value) : undefined}
            onKeyDown={isClickable ? (event: React.KeyboardEvent): void => handleCardKeyDown(event, card.column, card.value) : undefined}
            className={`rounded-lg border p-4 shadow-sm transition-colors ${
              isActive
                ? 'bg-blue-100 border-blue-300 cursor-pointer'
                : isClickable
                  ? 'bg-white border-gray-200 cursor-pointer hover:bg-blue-50'
                  : 'bg-white border-gray-200'
            }`}
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{computedValues[cardIndex]}</p>
          </div>
        );
      })}
    </div>
  );
}
