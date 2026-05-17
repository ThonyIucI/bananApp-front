'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Leaf,
  CalendarDays,
  Users,
  MapPin,
  BarChart3,
  Calendar,
  Sprout,
} from 'lucide-react';
import { useAuthContext } from '@/modules/auth/context/auth.context';
import { useStatsOverview } from '@/modules/dashboard/hooks/useStatsOverview';
import { useStatsMonthly } from '@/modules/dashboard/hooks/useStatsMonthly';
import { useStatsWeekly } from '@/modules/dashboard/hooks/useStatsWeekly';
import { useListUserPlots } from '@/modules/users/hooks/useListUserPlots';
import { KpiCard } from '@/modules/dashboard/components/KpiCard';
import { MonthlyTrendChart } from '@/modules/dashboard/components/MonthlyTrendChart';
import { WeeklyTrendChart } from '@/modules/dashboard/components/WeeklyTrendChart';
import { TopEnfundadoresList } from '@/modules/dashboard/components/TopEnfundadoresList';
import { TopPlotsList } from '@/modules/dashboard/components/TopPlotsList';
import { RibbonColorDonut } from '@/modules/dashboard/components/RibbonColorDonut';
import { HarvestColorChart } from '@/modules/dashboard/components/HarvestColorChart';
import { APP_ROUTES, PLOT_ROUTES, BUNDLING_ROUTES } from '@/@common/constants/routes';
import type { StatsOverviewFilters } from '@/modules/bundlings/services/bundling.service';

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <p className="mb-4 text-sm font-semibold text-gray-700">{title}</p>
    {children}
  </div>
);

const ChartSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`${height} animate-pulse rounded-xl bg-gray-100`} />
);

export default function DashboardPage() {
  const { user, isSuperadmin } = useAuthContext();

  const cooperative = user?.cooperatives?.[0];
  const cooperativeId = cooperative?.cooperativeId ?? '';

  const userRoles = user?.cooperatives?.flatMap((c) => c.roles) ?? [];
  const isAdmin = isSuperadmin || userRoles.includes('admin');
  const isBagger = !isAdmin && userRoles.includes('enfundador');
  const isMember = !isAdmin && !isBagger;

  const Overview = useStatsOverview();
  const Monthly = useStatsMonthly();
  const Weekly = useStatsWeekly();
  const UserPlots = useListUserPlots();

  useEffect(() => {
    if (!cooperativeId) return;

    const filters: StatsOverviewFilters | undefined = !isAdmin && user
      ? { scopedUserId: user.id }
      : undefined;

    Overview.handler(cooperativeId, filters);
    Monthly.handler(cooperativeId, 12, filters);
    Weekly.handler(cooperativeId, 8, undefined, filters);

    if (!isAdmin && user) {
      UserPlots.handler({ userId: user.id, cooperativeId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooperativeId, isAdmin, user?.id]);

  const overview = Overview.data;
  const months = Monthly.data?.months ?? [];
  const weeks = Weekly.data?.weeks ?? [];
  const assignedPlots = UserPlots.data ?? [];
  const harvestData = overview?.harvestThisWeek?.byRibbonColor ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-3 animate-page-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {user?.fullName?.split(' ')[0]}
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <KpiCard
          icon={Leaf}
          label="Fundas esta semana"
          value={overview?.thisWeek.totalQuantity.toLocaleString('es') ?? '—'}
          deltaPct={overview?.thisWeek.deltaPctVsLastPeriod}
          loading={Overview.loading}
        />
        <KpiCard
          icon={CalendarDays}
          label="Fundas este mes"
          value={overview?.thisMonth.totalQuantity.toLocaleString('es') ?? '—'}
          deltaPct={overview?.thisMonth.deltaPctVsLastPeriod}
          loading={Overview.loading}
        />
        <KpiCard
          icon={Users}
          label="Enfundadores activos"
          value={overview?.last30Days.activeEnfundadores ?? '—'}
          loading={Overview.loading}
        />
        <KpiCard
          icon={Sprout}
          label="Cosecha est. esta semana"
          value={overview?.harvestThisWeek?.estimatedBunches?.toLocaleString('es') ?? '—'}
          loading={Overview.loading}
        />
      </div>

      {/* Tendencia mensual */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Tendencia mensual</p>
          <span className="text-xs text-gray-400">últimos 12 meses</span>
        </div>
        {Monthly.loading ? <ChartSkeleton /> : <MonthlyTrendChart data={months} />}
      </div>

      {/* Tendencia semanal + Distribución cintas */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              {isBagger ? 'Mis fundas semanales' : 'Tendencia semanal'}
            </p>
            <span className="text-xs text-gray-400">últimas 8 semanas</span>
          </div>
          {Weekly.loading ? (
            <ChartSkeleton height="h-48" />
          ) : (
            <WeeklyTrendChart data={weeks} />
          )}
        </div>

        <SectionCard title="Distribución de cintas">
          <RibbonColorDonut
            data={overview?.ribbonColorDistribution ?? []}
            loading={Overview.loading}
          />
        </SectionCard>
      </div>

      {/* Cosecha estimada esta semana */}
      <SectionCard title="Cosecha estimada esta semana">
        <HarvestColorChart data={harvestData} loading={Overview.loading} />
      </SectionCard>

      {/* Top enfundadores + Top parcelas (admin) / Mis parcelas (bagger/member) */}
      {isAdmin ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Top enfundadores — últimos 30 días">
            <TopEnfundadoresList
              items={overview?.topEnfundadores ?? []}
              loading={Overview.loading}
            />
          </SectionCard>

          <SectionCard title="Top parcelas — últimos 30 días">
            <TopPlotsList
              items={overview?.topPlots ?? []}
              loading={Overview.loading}
            />
          </SectionCard>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Mis parcelas asignadas</p>
            <span className="text-xs text-gray-400">{assignedPlots.length} parcelas</span>
          </div>
          {UserPlots.loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : assignedPlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-10">
              <MapPin className="mb-2 h-8 w-8 text-gray-300" strokeWidth={1.2} />
              <p className="text-sm text-gray-400">No tienes parcelas asignadas</p>
              <p className="mt-0.5 text-xs text-gray-300">Contacta a tu administrador</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {assignedPlots.map((ap) => (
                <div
                  key={ap.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#27ae60]/10">
                    <MapPin className="h-4 w-4 text-[#27ae60]" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{ap.plot.name}</p>
                    <p className="text-xs text-gray-400">{ap.plot.sector.name}</p>
                  </div>
                  {ap.plot.areaHectares > 0 && (
                    <span className="ml-auto shrink-0 text-xs text-gray-400">
                      {ap.plot.areaHectares} ha
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {(isBagger || !isAdmin) && (
          <Link
            href={APP_ROUTES.BUNDLING_NEW}
            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#27ae60]/30 hover:shadow-md active:scale-[0.97]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#27ae60]/10 transition-colors group-hover:bg-[#27ae60]/20">
              <Leaf className="h-5 w-5 text-[#27ae60]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Registrar enfunde</p>
              <p className="text-xs text-gray-400">Nuevo registro de hoy</p>
            </div>
          </Link>
        )}

        <Link
          href={BUNDLING_ROUTES.LIST}
          className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#27ae60]/30 hover:shadow-md active:scale-[0.97]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#27ae60]/10 transition-colors group-hover:bg-[#27ae60]/20">
            <BarChart3 className="h-5 w-5 text-[#27ae60]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Historial de enfundes</p>
            <p className="text-xs text-gray-400">Ver todos los registros</p>
          </div>
        </Link>

        {isAdmin && (
          <>
            <Link
              href={PLOT_ROUTES.LIST}
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#27ae60]/30 hover:shadow-md active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#27ae60]/10 transition-colors group-hover:bg-[#27ae60]/20">
                <MapPin className="h-5 w-5 text-[#27ae60]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Asignar parcelas</p>
                <p className="text-xs text-gray-400">Gestión de enfundadores</p>
              </div>
            </Link>

            <Link
              href={APP_ROUTES.RIBBON_CALENDAR}
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#27ae60]/30 hover:shadow-md active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#27ae60]/10 transition-colors group-hover:bg-[#27ae60]/20">
                <Calendar className="h-5 w-5 text-[#27ae60]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Calendario de cintas</p>
                <p className="text-xs text-gray-400">Semana actual y próximas</p>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
