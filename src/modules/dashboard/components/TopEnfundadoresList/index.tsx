'use client';

import { StatsTopEnfundador } from '@/modules/bundlings/services/bundling.service';
import { Users } from 'lucide-react';

interface TopEnfundadoresListProps {
  items: StatsTopEnfundador[];
  loading?: boolean;
}

/** Returns the initials from a full name */
const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

/**
 * Ranked list of top enfundadores by total quantity in the last 30 days.
 * Shows rank badge, avatar with initials, name, and a quantity bar.
 */
export const TopEnfundadoresList = ({ items, loading }: TopEnfundadoresListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-1.5 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="h-3 w-12 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Users className="mb-2 h-8 w-8 text-gray-300" strokeWidth={1.2} />
        <p className="text-sm text-gray-400">Sin datos este período</p>
      </div>
    );
  }

  const maxQty = items[0]?.totalQuantity ?? 1;

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.userId} className="flex items-center gap-3">
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

          {/* avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#27ae60]/10 text-xs font-bold text-[#27ae60]">
            {getInitials(item.fullName)}
          </div>

          {/* name + bar */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{item.fullName}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#27ae60] transition-all duration-500"
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
