'use client';

import { StatsTopPlot } from '@/modules/bundlings/services/bundling.service';
import { MapPin } from 'lucide-react';

interface TopPlotsListProps {
  items: StatsTopPlot[];
  loading?: boolean;
}

/**
 * Ranked list of top plots by total bundling quantity in the last 30 days.
 * Shows rank badge, plot name, and a proportional quantity bar.
 */
export const TopPlotsList = ({ items, loading }: TopPlotsListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-6 w-6 animate-pulse rounded-full bg-gray-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
              <div className="h-1.5 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <MapPin className="mb-2 h-8 w-8 text-gray-300" strokeWidth={1.2} />
        <p className="text-sm text-gray-400">Sin datos este período</p>
      </div>
    );
  }

  const maxQty = items[0]?.totalQuantity ?? 1;

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.plotId} className="flex items-center gap-3">
          {/* rank badge */}
          <div
            className={[
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              index === 0
                ? 'bg-[#27ae60] text-white'
                : index === 1
                  ? 'bg-gray-200 text-gray-600'
                  : 'bg-gray-100 text-gray-500',
            ].join(' ')}
          >
            {index + 1}
          </div>

          {/* icon */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#27ae60]/10">
            <MapPin className="h-4 w-4 text-[#27ae60]" strokeWidth={1.8} />
          </div>

          {/* name + bar */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{item.plotName}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#27ae60]/70 transition-all duration-500"
                style={{ width: `${(item.totalQuantity / maxQty) * 100}%` }}
              />
            </div>
          </div>

          {/* quantity */}
          <span className="shrink-0 text-sm font-semibold text-gray-700">
            {item.totalQuantity.toLocaleString('es')}
          </span>
        </div>
      ))}
    </div>
  );
};
