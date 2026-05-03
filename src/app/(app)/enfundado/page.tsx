'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Package, Pencil, Trash2, Clock } from 'lucide-react';
import { useAuthContext } from '@/modules/auth/context/auth.context';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { useConfirmModal } from '@/@common/hooks/useConfirmModal';
import { useListBundlings } from '@/modules/bundlings/hooks/useListBundlings';
import { useListPlots } from '@/modules/plots/hooks/useListPlots';
import { useListUsers } from '@/modules/users/hooks/useListUsers';
import { useDeleteBundling } from '@/modules/bundlings/hooks/useDeleteBundling';
import type { UserPlotResponse } from '@/modules/users/services/user-plot.service';
import { BundlingFormModal } from '@/modules/bundlings/components/BundlingFormModal';
import { RowActions } from '@/@common/components/RowActions';
import { RIBBON_COLOR_HEX, RIBBON_COLOR_LABELS } from '@/@common/constants/ribbon-colors';
import type { RibbonColor } from '@/@common/constants/ribbon-colors';
import { formatDate } from '@/@common/utils/date';
import type { BundlingResponse } from '@/modules/bundlings/services/bundling.service';
import { isBundlingArray } from '@/modules/bundlings/services/bundling.service';
import { getQueuedBundlings } from '@/lib/offline/sync-manager';
import type { QueuedBundling } from '@/lib/offline/db';
import { useListUserPlots } from '@/modules/users/hooks/useListUserPlots';
import { Button } from '@/components/ui/button';

// ─── Pending badge ────────────────────────────────────────────────────────────

const PendingBadge = ({ status }: { status: QueuedBundling['status'] }) => {
  if (status === 'synced') return null;
  const label = status === 'failed' ? 'Error' : 'Pendiente';
  const color = status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      <Clock className="h-3 w-3" />
      {label}
    </span>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

/** Bundling history page — view, register, edit, and delete bundling records (offline-first). */
const EnfundadoPage = () => {
  const { user, isSuperadmin } = useAuthContext();
  const cooperativeId = user?.cooperatives?.[0]?.cooperativeId ?? '';

  const ListBundlings = useListBundlings();
  const ListPlots = useListPlots();
  const ListUserPlots = useListUserPlots();
  const ListUsers = useListUsers();
  const DeleteBundling = useDeleteBundling();
  const showForm = useBoolean();
  const { confirm, dialog } = useConfirmModal();

  const [editTarget, setEditTarget] = useState<BundlingResponse | undefined>();
  const [queuedItems, setQueuedItems] = useState<QueuedBundling[]>([]);

  // Superadmin sees all plots; other roles see only their assigned plots.
  // TODO: replace with indexdb lookup for offline support
  const plots: UserPlotResponse[] = isSuperadmin
    ? (ListPlots.data?.items ?? []).map((p) => ({
        id: p.id,
        assignedAt: '',
        notes: null,
        plot: { id: p.id, name: p.name, areaHectares: p.areaHectares, sector: { id: p.sector.id, name: p.sector.name } },
      }))
    : (ListUserPlots.data ?? []);
  const users = ListUsers.data?.items ?? [];

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!cooperativeId || !user) return;
    ListBundlings.handler({ cooperativeId, enfundadorUserId: isSuperadmin ? undefined : user.id, limit: 100 });
    if (isSuperadmin) {
      ListUsers.handler();
      // TODO: traer plots de indexdb en lugar de endpoint
      ListPlots.handler({ cooperativeId, limit: 100 });
    } else {
      ListUserPlots.handler({ userId: user.id, cooperativeId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooperativeId]);

  // Load queued items from IDB (pending + failed + recent synced)
  useEffect(() => {
    getQueuedBundlings()
      .then(setQueuedItems)
      .catch(() => {});
  }, []);

  // ── Merged list (synced from API + pending from IDB) ──────────────────────

  const syncedIds = useMemo(
    () => new Set((ListBundlings.data?.items ?? []).map((b) => b.localUuid)),
    [ListBundlings.data],
  );

  /** Pending/failed items not yet reflected in the API response. */
  const localPending = useMemo(
    () =>
      queuedItems.filter(
        (q) => (q.status === 'pending' || q.status === 'failed') && !syncedIds.has(q.localUuid),
      ),
    [queuedItems, syncedIds],
  );

  const bundlingList = ListBundlings.data?.items ?? [];
  const totalCount = bundlingList.length + localPending.length;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaved = (b: BundlingResponse | BundlingResponse[]) => {
    if (isBundlingArray(b)) {
      b.forEach((item) => ListBundlings.onUpsert(item));
    } else {
      ListBundlings.onUpsert(b);
    }
    // Refresh queue so new items show "Pendiente" if they were offline
    getQueuedBundlings()
      .then(setQueuedItems)
      .catch(() => {});
  };

  const openCreate = () => {
    setEditTarget(undefined);
    showForm.on();
  };

  const openEdit = (b: BundlingResponse) => {
    setEditTarget(b);
    showForm.on();
  };

  const handleDelete = async (b: BundlingResponse) => {
    const ok = await confirm({
      title: '¿Eliminar enfunde?',
      description: `Se eliminarán ${b.quantity} fundas registradas en "${b.plot.name}". Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      variant: 'destructive',
    });
    if (!ok) return;
    await DeleteBundling.handler(b.id, cooperativeId);
    ListBundlings.onRemove(b.id);
  };

  const rowActions = (b: BundlingResponse) => [
    { icon: Pencil, label: 'Editar', onClick: () => openEdit(b), inline: true },
    { icon: Trash2, label: 'Eliminar', onClick: () => handleDelete(b), variant: 'destructive' as const },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mis enfundes</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {totalCount} registro{totalCount !== 1 ? 's' : ''}
              {localPending.length > 0 && (
                <span className="ml-2 font-medium text-amber-600">
                  ({localPending.length} sin sincronizar)
                </span>
              )}
            </p>
          </div>
          <Button onClick={openCreate} >
            <Plus className="h-4 w-4" />
            Registrar enfunde
          </Button>
        </div>

        {ListBundlings.loading && totalCount === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#27ae60] border-t-transparent" />
          </div>
        )}

        {!ListBundlings.loading && totalCount === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16">
            <Package className="mb-3 h-10 w-10 text-gray-300" strokeWidth={1.2} />
            <p className="text-sm font-medium text-gray-500">Ningún enfunde registrado</p>
            <p className="mt-1 text-xs text-gray-400">Registra el primero usando el botón superior</p>
          </div>
        )}

        {/* ── Desktop table ────────────────────────────────────────────────── */}
        {totalCount > 0 && (
          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Parcela</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Enfundador</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Fundas</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cinta</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Notas</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Pending local items first */}
                {localPending.map((q) => (
                  <tr key={q.localUuid} className="bg-amber-50/60">
                    <td className="px-5 py-3 text-gray-500">{formatDate(q.payload.bundledAt)}</td>
                    <td className="px-5 py-3 font-medium text-gray-700">
                      <span className="text-gray-400 text-xs italic">(parcela pendiente)</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">—</td>
                    <td className="px-5 py-3 text-gray-900">{(q.payload.quantity ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      {q.payload.ribbonColorFree ? (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: RIBBON_COLOR_HEX[q.payload.ribbonColorFree as RibbonColor] }}
                          />
                          <span className="text-gray-600">{RIBBON_COLOR_LABELS[q.payload.ribbonColorFree as RibbonColor]}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="max-w-45 truncate px-5 py-3 text-gray-400">{q.payload.notes ?? '—'}</td>
                    <td className="px-3 py-3">
                      <PendingBadge status={q.status} />
                    </td>
                  </tr>
                ))}

                {/* Synced items from API */}
                {bundlingList.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500">{formatDate(b.bundledAt)}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{b.plot.name}</td>
                    <td className="px-5 py-3 text-gray-600">{b.enfundadorUser.fullName}</td>
                    <td className="px-5 py-3 text-gray-900">{b.quantity.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      {b.ribbonColorFree ? (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: RIBBON_COLOR_HEX[b.ribbonColorFree as RibbonColor] }}
                          />
                          <span className="text-gray-600">{RIBBON_COLOR_LABELS[b.ribbonColorFree as RibbonColor]}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="max-w-45 truncate px-5 py-3 text-gray-400">{b.notes ?? '—'}</td>
                    <td className="px-3 py-3">
                      <RowActions actions={rowActions(b)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Mobile cards ─────────────────────────────────────────────────── */}
        {totalCount > 0 && (
          <div className="space-y-3 md:hidden">
            {/* Pending local cards first */}
            {localPending.map((q) => (
              <div key={q.localUuid} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-amber-700 italic">Parcela pendiente de sync</p>
                    <p className="mt-0.5 text-xs text-gray-500">{formatDate(q.payload.bundledAt)}</p>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{(q.payload.quantity ?? 0).toLocaleString()} fundas</p>
                    </div>
                    <PendingBadge status={q.status} />
                  </div>
                </div>
                {q.payload.ribbonColorFree && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-black/10"
                      style={{ backgroundColor: RIBBON_COLOR_HEX[q.payload.ribbonColorFree as RibbonColor] }}
                    />
                    <span className="text-xs text-gray-500">
                      {RIBBON_COLOR_LABELS[q.payload.ribbonColorFree as RibbonColor]}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Synced cards from API */}
            {bundlingList.map((b) => (
              <div key={b.id} className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{b.plot.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{b.enfundadorUser.fullName}</p>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{b.quantity.toLocaleString()} fundas</p>
                      <p className="mt-0.5 text-xs text-gray-400">{formatDate(b.bundledAt)}</p>
                    </div>
                    <RowActions actions={rowActions(b)} />
                  </div>
                </div>
                {b.ribbonColorFree && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-black/10"
                      style={{ backgroundColor: RIBBON_COLOR_HEX[b.ribbonColorFree as RibbonColor] }}
                    />
                    <span className="text-xs text-gray-500">
                      {RIBBON_COLOR_LABELS[b.ribbonColorFree as RibbonColor]}
                    </span>
                  </div>
                )}
                {b.notes && (
                  <p className="mt-1.5 truncate text-xs text-gray-400">{b.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <BundlingFormModal
          open={showForm.active}
          onClose={showForm.off}
          onSaved={handleSaved}
          plots={plots}
          users={users}
          userId={user?.id}
          isAdmin={isSuperadmin}
          cooperativeId={cooperativeId}
          bundling={editTarget}
        />
      </div>

      {dialog}
    </>
  );
};

export default EnfundadoPage;
