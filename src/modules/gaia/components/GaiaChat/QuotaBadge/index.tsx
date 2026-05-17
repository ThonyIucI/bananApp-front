'use client';

import { Zap } from 'lucide-react';

interface QuotaBadgeProps {
  remaining: number | null;
  limit: number;
}

/** Displays daily interaction quota. Warns when low, blocks with upgrade CTA when exhausted. */
export const QuotaBadge = ({ remaining, limit }: QuotaBadgeProps) => {
  if (remaining === null) return null;

  const isExhausted = remaining === 0;
  const isLow = remaining > 0 && remaining <= 5;

  if (isExhausted) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 ring-1 ring-red-200">
        <Zap className="h-3 w-3" />
        <span>Límite diario alcanzado</span>
        <span className="ml-1 cursor-pointer font-semibold underline hover:text-red-700">
          Mejorar plan
        </span>
      </div>
    );
  }

  return (
    <div
      className={[
        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors',
        isLow
          ? 'bg-amber-50 text-amber-700 ring-amber-200'
          : 'bg-gray-50 text-gray-500 ring-gray-200',
      ].join(' ')}
    >
      <Zap className={`h-3 w-3 ${isLow ? 'text-amber-500' : 'text-gray-400'}`} />
      <span>
        {remaining} / {limit} hoy
      </span>
    </div>
  );
};
