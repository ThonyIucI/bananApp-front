'use client';

import { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { DetailPanel } from '@/@common/components/DetailPanel';
import { formatDate } from '@/@common/utils/date';
import { ROLE_LABELS, type UserResponse, type TRoleKey } from '@/modules/users/services/user.service';
import { useListUserPlots } from '@/modules/users/hooks/useListUserPlots';

interface UserDetailPanelProps {
  user: UserResponse;
  onClose: () => void;
}

/** Slide-in panel showing full user info, cooperative memberships, and plot assignments. */
export const UserDetailPanel = ({ user, onClose }: UserDetailPanelProps) => {
  const cooperativeId = user.cooperatives?.[0]?.cooperativeId ?? '';
  const ListUserPlots = useListUserPlots();
  const plots = ListUserPlots.data ?? [];

  useEffect(() => {
    if (!cooperativeId) return;
    ListUserPlots.handler({ userId: user.id, cooperativeId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, cooperativeId]);

  return (
    <DetailPanel title={user.fullName} subtitle={user.email} onClose={onClose}>
      <div className="space-y-4">
        <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100">
          {([
            { label: 'DNI', value: user.dni ?? '—' },
            { label: 'Estado', value: user.isActive ? 'Activo' : 'Inactivo' },
            { label: 'Superadmin', value: user.isSuperadmin ? 'Sí' : 'No' },
            { label: 'Alta', value: formatDate(user.createdAt) },
          ] as { label: string; value: string }[]).map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Cooperativas</h3>
          {user.cooperatives.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-center text-xs text-gray-400">
              Sin cooperativas asignadas
            </p>
          ) : (
            <div className="space-y-2">
              {user.cooperatives.map((c) => (
                <div key={c.cooperativeId} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{c.cooperativeName}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {c.roles.map((r) => ROLE_LABELS[r as TRoleKey] ?? r).join(', ')}
                    {c.memberCode && <span className="ml-2 font-mono text-gray-400">#{c.memberCode}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Parcelas asignadas</h3>
          {ListUserPlots.loading && (
            <div className="flex items-center justify-center py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#27ae60] border-t-transparent" />
            </div>
          )}
          {!ListUserPlots.loading && plots.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-center text-xs text-gray-400">
              Sin parcelas asignadas
            </p>
          )}
          {!ListUserPlots.loading && plots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {plots.map((up) => (
                <span
                  key={up.id}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
                >
                  <MapPin className="h-2.5 w-2.5 text-[#27ae60]" />
                  {up.plot.name}
                  <span className="text-gray-400">· {up.plot.sector.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </DetailPanel>
  );
};
