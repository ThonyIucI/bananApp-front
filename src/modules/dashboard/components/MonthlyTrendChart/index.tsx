'use client';

import { StatsMonthEntry } from '@/modules/bundlings/services/bundling.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyTrendChartProps {
  data: StatsMonthEntry[];
  loading?: boolean;
}

interface RechartTooltipProps {
  active?: boolean;
  payload?: { payload: StatsMonthEntry }[];
  label?: string;
}

/** Custom recharts tooltip matching the app design system */
const CustomTooltip = ({ active, payload, label }: RechartTooltipProps) => {
  if (!active || !payload?.length) return null;

  const entry = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900">
        {entry?.totalQuantity?.toLocaleString('es') ?? 0}{' '}
        <span className="font-normal text-gray-500">fundas</span>
      </p>
      <p className="text-xs text-gray-400">
        {entry?.totalRecords ?? 0} registros · {entry?.activeEnfundadores ?? 0} enfundadores
      </p>
    </div>
  );
};

/**
 * Bar chart showing monthly bundling totals for the last N months.
 * Zero-value months are rendered with a subtle min-height bar.
 */
export const MonthlyTrendChart = ({ data, loading }: MonthlyTrendChartProps) => {
  if (loading) {
    return (
      <div className="flex h-64 items-end gap-2 px-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-t-lg bg-gray-100"
            style={{ height: `${20 + (i % 5) * 15}%` }}
          />
        ))}
      </div>
    );
  }

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27ae6010' }} />
        <Bar
          dataKey="totalQuantity"
          fill="#27ae60"
          radius={[4, 4, 0, 0]}
          minPointSize={2}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};