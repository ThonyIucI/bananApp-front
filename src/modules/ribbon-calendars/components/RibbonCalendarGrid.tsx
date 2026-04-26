'use client';

import { useState } from 'react';
import { RIBBON_COLOR_HEX, RIBBON_COLOR_LABELS, RIBBON_COLORS_CYCLE } from '@/@common/constants/ribbon-colors';
import type { WeekEntry } from '../services/ribbon-calendar.service';

interface Props {
  weeks: WeekEntry[];
  currentWeek: number | null;
  currentYear: number;
  startColorIndex: number;
  canConfigure: boolean;
  onConfigure: (index: number) => Promise<void>;
}

const EASING = 'cubic-bezier(0.23, 1, 0.32, 1)';

export function RibbonCalendarGrid({
  weeks,
  currentWeek,
  currentYear,
  startColorIndex,
  canConfigure,
  onConfigure,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const handleConfigure = async (index: number) => {
    setPendingIndex(index);
    setSaving(true);
    try {
      await onConfigure(index);
    } finally {
      setSaving(false);
      setPendingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Calendario de cintas {currentYear}
          </h2>
          {currentWeek && (
            <p className="mt-0.5 text-sm text-gray-500">
              Semana actual:{' '}
              <span className="font-medium text-gray-800">
                S{currentWeek} — {RIBBON_COLOR_LABELS[weeks[currentWeek - 1]?.color]}
              </span>
            </p>
          )}
        </div>

        {canConfigure && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Color inicial (S1):</span>
            <div className="flex gap-1.5">
              {RIBBON_COLORS_CYCLE.map((color, i) => (
                <button
                  key={color}
                  title={RIBBON_COLOR_LABELS[color]}
                  disabled={saving}
                  onClick={() => handleConfigure(i)}
                  style={{
                    backgroundColor: RIBBON_COLOR_HEX[color],
                    outline: startColorIndex === i ? `2px solid #27ae60` : undefined,
                    outlineOffset: startColorIndex === i ? '2px' : undefined,
                    transition: `transform 160ms ${EASING}, opacity 160ms ${EASING}`,
                    opacity: saving && pendingIndex !== i ? 0.4 : 1,
                  }}
                  className="h-5 w-5 cursor-pointer rounded-full border border-black/10 hover:scale-110 active:scale-95"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1.5 sm:gap-2">
        {weeks.map(({ week, color }, index) => {
          const isCurrent = week === currentWeek;
          const hex = RIBBON_COLOR_HEX[color];
          const isLight = color === 'white' || color === 'yellow';

          return (
            <div
              key={week}
              title={`S${week} — ${RIBBON_COLOR_LABELS[color]}`}
              style={{
                backgroundColor: hex,
                animationDelay: `${index * 8}ms`,
                // Ring for current week
                boxShadow: isCurrent ? `0 0 0 2px #27ae60, 0 0 0 4px #27ae6033` : undefined,
                transition: `transform 160ms ${EASING}, box-shadow 160ms ${EASING}`,
              }}
              className={[
                'relative flex aspect-square flex-col items-center justify-center rounded-lg border',
                isLight ? 'border-gray-300' : 'border-black/10',
                isCurrent ? 'z-10 scale-110' : '',
                // Stagger entry animation
                'animate-cell-in',
                // Hover — gated by CSS media query in globals.css
                'can-hover:hover:scale-105',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className={`text-[10px] font-semibold leading-none sm:text-xs ${
                  isLight ? 'text-gray-700' : 'text-white'
                } ${isCurrent ? 'drop-shadow-sm' : ''}`}
              >
                {week}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
        {RIBBON_COLORS_CYCLE.map((color) => (
          <div key={color} className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full border border-black/10"
              style={{ backgroundColor: RIBBON_COLOR_HEX[color] }}
            />
            <span className="text-xs text-gray-500">{RIBBON_COLOR_LABELS[color]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
