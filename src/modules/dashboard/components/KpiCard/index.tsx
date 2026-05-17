'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface KpiCardProps {
  /** Lucide icon to display */
  icon: LucideIcon;
  /** Short label under the value */
  label: string;
  /** Main numeric or string value */
  value: string | number;
  /** Secondary descriptive text (e.g. "últimos 30 días") */
  description?: string;
  /** Delta percentage vs previous period. Null when previous period has no data. */
  deltaPct?: number | null;
  /** Whether the component is loading */
  loading?: boolean;
}

/** Formats a numeric delta with sign for display */
const formatDelta = (delta: number): string =>
  `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;

/**
 * Reusable KPI card for the stats dashboard.
 * Shows an icon, a large value, a label, and an optional trend indicator.
 */
export const KpiCard = ({ icon: Icon, label, value, description, deltaPct, loading }: KpiCardProps) => {
  const hasDelta = deltaPct !== null && deltaPct !== undefined;
  const isPositive = hasDelta && deltaPct > 0;
  const isNeutral = hasDelta && deltaPct === 0;

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div>

          {!hasDelta && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#27ae60]/10">
            <Icon className="h-4 w-4 text-[#27ae60]" strokeWidth={1.8} />
          </div>}
          {hasDelta && !loading && (
            <div
              className={[
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                isNeutral
                  ? 'bg-gray-100 text-gray-500'
                  : isPositive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-50 text-red-600',
              ].join(' ')}
            >
              {isNeutral ? (
                <Minus className="h-3 w-3" />
              ) : isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatDelta(deltaPct)}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className='h-7 w-24' />
          <Skeleton className='h-3.5' />
        </div>
      ) : (
        <div className='flex flex-col'>
          <span className="mt-0 text-sm font-medium text-gray-500">{label}</span>
          {description && (
            <span className="mt-0 text-xs text-gray-400">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};
