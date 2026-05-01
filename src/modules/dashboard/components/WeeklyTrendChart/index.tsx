'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/@common/utils/date';
import { StatsWeekEntry } from '@/modules/bundlings/services/bundling.service';

interface WeeklyTrendChartProps {
  data: StatsWeekEntry[];
  loading?: boolean;
}

interface RechartTooltipProps {
  active?: boolean;
  payload?: { payload: StatsWeekEntry }[];
  label?: string;
}

/** Custom recharts tooltip matching the app design system */
const CustomTooltip = ({ active, payload, label }: RechartTooltipProps) => {
  if (!active || !payload?.length) return null;

  const entry = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-xs text-gray-400">
        {formatDate(entry.startDate)} — {formatDate(entry.endDate)}
      </p>
      <p className="mt-2 text-sm font-bold text-gray-900">
        {entry.totalQuantity.toLocaleString('es')}{' '}
        <span className="font-normal text-gray-500">fundas</span>
      </p>
      <p className="text-xs text-gray-400">{entry.totalRecords} registros</p>
    </div>
  );
};

/**
 * Area chart showing weekly bundling totals for the last N weeks.
 * Used in both the admin view and the personal enfundador view.
 */
export const WeeklyTrendChart = ({ data, loading }: WeeklyTrendChartProps) => {
  if (loading) {
    return (
      <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
    );
  }

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={192}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#27ae60" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#27ae60" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27ae60', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="totalQuantity"
          stroke="#27ae60"
          strokeWidth={2}
          fill="url(#weeklyGradient)"
          dot={{ fill: '#27ae60', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: '#27ae60', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
