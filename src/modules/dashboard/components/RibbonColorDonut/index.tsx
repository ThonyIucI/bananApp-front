'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { RIBBON_COLOR_HEX, RIBBON_COLOR_LABELS, type RibbonColor } from '@/@common/constants/ribbon-colors';
import { StatsRibbonColor } from '@/modules/bundlings/services/bundling.service';

interface RibbonColorDonutProps {
  data: StatsRibbonColor[];
  loading?: boolean;
}

interface RechartTooltipProps {
  active?: boolean;
  payload?: { payload: StatsRibbonColor; value: number }[];
}

/** Maps the "calendar" special key to a neutral color */
const CALENDAR_COLOR = '#9ca3af';
const CALENDAR_LABEL = 'Calendario';

const resolveColor = (key: string): string =>
  key === 'calendar' ? CALENDAR_COLOR : (RIBBON_COLOR_HEX[key as RibbonColor] ?? '#e5e7eb');

const resolveLabel = (key: string): string =>
  key === 'calendar' ? CALENDAR_LABEL : (RIBBON_COLOR_LABELS[key as RibbonColor] ?? key);

/** Custom tooltip matching the design system */
const CustomTooltip = ({ active, payload }: RechartTooltipProps) => {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const total = entry?.value ?? 0;
  const label = resolveLabel(entry?.payload.color ?? '');

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: resolveColor(entry.payload.color) }}
        />
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </div>
      <p className="mt-1 text-sm font-bold text-gray-900">
        {total.toLocaleString('es')}{' '}
        <span className="font-normal text-gray-500">fundas</span>
      </p>
    </div>
  );
};

/**
 * Donut chart showing distribution of ribbon colors (and calendar assignments)
 * for the last 30 days. Includes a legend below the chart.
 */
export const RibbonColorDonut = ({ data, loading }: RibbonColorDonutProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="h-40 w-40 animate-pulse rounded-full bg-gray-100" />
        <div className="w-full space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-gray-100" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-sm text-gray-400">Sin datos este período</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.totalQuantity, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="totalQuantity"
              nameKey="color"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.color} fill={resolveColor(entry.color)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-bold text-gray-900">{total.toLocaleString('es')}</p>
          <p className="text-xs text-gray-400">fundas</p>
        </div>
      </div>

      {/* legend */}
      <div className="w-full space-y-2">
        {data.map((entry) => {
          const pct = total > 0 ? ((entry.totalQuantity / total) * 100).toFixed(1) : '0';
          return (
            <div key={entry.color} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: resolveColor(entry.color) }}
                />
                <span className="truncate text-xs text-gray-600">{resolveLabel(entry.color)}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-gray-400">{pct}%</span>
                <span className="text-xs font-medium text-gray-700">
                  {entry.totalQuantity.toLocaleString('es')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
