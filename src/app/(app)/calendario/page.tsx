'use client';

import { useAuthContext } from '@/modules/auth/context/auth.context';
import { useRibbonCalendar } from '@/modules/ribbon-calendars/hooks/useRibbonCalendar';
import { RibbonCalendarGrid } from '@/modules/ribbon-calendars/components/RibbonCalendarGrid';
import { RIBBON_COLOR_HEX, RIBBON_COLOR_LABELS } from '@/@common/constants/ribbon-colors';

export default function RibbonCalendarPage() {
  const { user } = useAuthContext();
  const cooperative = user?.cooperatives?.[0];
  const year = new Date().getFullYear();

  const roles = cooperative?.roles ?? [];
  const canConfigure =
    roles.includes('admin') || roles.includes('superadmin') || !!user?.isSuperadmin;

  const { currentWeek, weeks, startColorIndex, loading, configure } = useRibbonCalendar(
    cooperative?.cooperativeId ?? '',
    year,
  );

  if (!cooperative) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-gray-500">No estás asignado a ninguna cooperativa.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendario de cintas</h1>
        <p className="mt-1 text-sm text-gray-500">{cooperative.cooperativeName}</p>
      </div>

      {/* Current week hero */}
      {currentWeek && (
        <div
          className="flex items-center gap-4 rounded-2xl p-5 shadow-sm"
          style={{
            backgroundColor: RIBBON_COLOR_HEX[currentWeek.color] + '22',
            border: `1.5px solid ${RIBBON_COLOR_HEX[currentWeek.color]}44`,
          }}
        >
          <div
            className="h-12 w-12 flex-shrink-0 rounded-xl border border-black/10 shadow-sm"
            style={{ backgroundColor: RIBBON_COLOR_HEX[currentWeek.color] }}
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Esta semana (S{currentWeek.week})
            </p>
            <p className="mt-0.5 text-xl font-bold text-gray-900">
              Cinta {RIBBON_COLOR_LABELS[currentWeek.color]}
            </p>
          </div>
        </div>
      )}

      {/* Grid card */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1.5 sm:gap-2">
            {Array.from({ length: 52 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-gray-100"
                style={{ animationDelay: `${i * 8}ms` }}
              />
            ))}
          </div>
        ) : (
          <RibbonCalendarGrid
            weeks={weeks}
            currentWeek={currentWeek?.week ?? null}
            currentYear={year}
            startColorIndex={startColorIndex}
            canConfigure={canConfigure}
            onConfigure={configure}
          />
        )}
      </div>
    </div>
  );
}
