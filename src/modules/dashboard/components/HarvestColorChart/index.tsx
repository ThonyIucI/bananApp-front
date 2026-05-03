'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Sprout } from 'lucide-react';
import {
  RIBBON_COLOR_HEX,
  RIBBON_COLOR_LABELS,
  type RibbonColor,
} from '@/@common/constants/ribbon-colors';
import type { StatsHarvestColorEntry } from '@/modules/bundlings/services/bundling.service';

interface HarvestColorChartProps {
  data: StatsHarvestColorEntry[];
  loading?: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: StatsHarvestColorEntry; value: number }[];
}

const UNKNOWN_COLOR = '#9ca3af';

const resolveHex = (key: string): string =>
  RIBBON_COLOR_HEX[key as RibbonColor] ?? UNKNOWN_COLOR;

const resolveLabel = (key: string): string =>
  RIBBON_COLOR_LABELS[key as RibbonColor] ?? key;

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: resolveHex(entry.payload.color) }}
        />
        <p className="text-sm font-medium text-gray-700">
          {resolveLabel(entry.payload.color)}
        </p>
      </div>
      <p className="mt-1 text-sm font-bold text-gray-900">
        {entry.value.toLocaleString('es')}{' '}
        <span className="font-normal text-gray-500">racimos</span>
      </p>
    </div>
  );
};

/**
 * Bar chart showing estimated harvest this week by ribbon color.
 * Based on bundlings registered exactly 12 weeks ago.
 */
export const HarvestColorChart = ({ data, loading }: HarvestColorChartProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 animate-pulse rounded-full bg-gray-100" />
            <div className="h-6 flex-1 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Sprout className="mb-2 h-8 w-8 text-gray-300" strokeWidth={1.2} />
        <p className="text-sm text-gray-400">Sin cosecha estimada esta semana</p>
        <p className="mt-0.5 text-xs text-gray-300">No hay enfundes de hace 12 semanas</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: resolveLabel(d.color),
    fill: resolveHex(d.color),
  }));

  return (
    <div className="space-y-4">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={52}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Bar dataKey="totalQuantity" radius={[0, 6, 6, 0]} maxBarSize={20}>
              {chartData.map((entry) => (
                <Cell key={entry.color} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* legend with totals */}
      <div className="space-y-1.5">
        {data.map((entry) => (
          <div key={entry.color} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: resolveHex(entry.color) }}
              />
              <span className="truncate text-xs text-gray-600">{resolveLabel(entry.color)}</span>
            </div>
            <span className="text-xs font-medium text-gray-700">
              {entry.totalQuantity.toLocaleString('es')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
