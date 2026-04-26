'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuthContext } from '@/modules/auth/context/auth.context';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { useListPlots } from '@/modules/plots/hooks/useListPlots';
import { useDeletePlot } from '@/modules/plots/hooks/useDeletePlot';
import { useListSectors } from '@/modules/sectors/hooks/useListSectors';
import { useListUsers } from '@/modules/users/hooks/useListUsers';
import { PlotFormModal } from '@/modules/plots/components/PlotFormModal';
import { PlotDetailPanel } from '@/modules/plots/components/PlotDetailPanel';
import { RowActions } from '@/@common/components/RowActions';
import type { PlotResponse } from '@/modules/plots/services/plot.service';

/** Plot list page — create, edit, delete plots, filterable by sector. */
const ParcelasPage = () => {
  const { user } = useAuthContext();
  const cooperativeId = user?.cooperatives?.[0]?.cooperativeId ?? '';

  const ListPlots = useListPlots();
  const ListSectors = useListSectors();
  const ListUsers = useListUsers();
  const DeletePlot = useDeletePlot();
  const showForm = useBoolean();

  const plotList = ListPlots.data?.items ?? [];
  const sectors = ListSectors.data ?? [];
  const users = ListUsers.data?.items ?? [];

  const [editTarget, setEditTarget] = useState<PlotResponse | undefined>();
  const [detail, setDetail] = useState<PlotResponse | null>(null);
  const [sectorFilter, setSectorFilter] = useState('');

  useEffect(() => {
    if (!cooperativeId) return;
    ListPlots.handler({ cooperativeId, limit: 100 });
    ListSectors.handler(cooperativeId);
    ListUsers.handler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooperativeId]);

  const filtered = sectorFilter ? plotList.filter((p) => p.sector.id === sectorFilter) : plotList;

  const handleSaved = (p: PlotResponse) => {
    ListPlots.onUpsert(p);
    if (detail?.id === p.id) setDetail(p);
  };

  const handleDelete = async (p: PlotResponse) => {
    if (!confirm(`¿Eliminar parcela "${p.name}"?`)) return;
    await DeletePlot.handler(p.id);
    ListPlots.onRemove(p.id);
    if (detail?.id === p.id) setDetail(null);
  };

  const openCreate = () => {
    setEditTarget(undefined);
    showForm.on();
  };

  const openEdit = (p: PlotResponse) => {
    setEditTarget(p);
    showForm.on();
  };

  const rowActions = (p: PlotResponse) => [
    { icon: Pencil, label: 'Editar', onClick: () => openEdit(p), inline: true },
    { icon: Trash2, label: 'Eliminar', onClick: () => handleDelete(p), variant: 'destructive' as const },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Parcelas</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {filtered.length} parcela{filtered.length !== 1 ? 's' : ''}
            {sectorFilter ? ' en este sector' : ' registradas'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white shadow-sm transition-[transform,background-color] duration-160 ease-out hover:bg-[#219a52] active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          Nueva parcela
        </button>
      </div>

      {sectors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSectorFilter('')}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${!sectorFilter ? 'bg-[#27ae60] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos
          </button>
          {sectors.map((s) => (
            <button
              key={s.id}
              onClick={() => setSectorFilter(s.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${sectorFilter === s.id ? 'bg-[#27ae60] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {ListPlots.loading && plotList.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#27ae60] border-t-transparent" />
        </div>
      )}

      {!ListPlots.loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16">
          <p className="text-sm font-medium text-gray-500">Ninguna parcela registrada</p>
          <p className="mt-1 text-xs text-gray-400">Crea la primera usando el botón superior</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Parcela</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Sector</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Propietario</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Área</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Lotes</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} onClick={() => setDetail(p)} className="cursor-pointer transition-colors hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3 text-gray-600">{p.sector.name}</td>
                  <td className="px-5 py-3 text-gray-600">{p.ownerUser?.fullName}</td>
                  <td className="px-5 py-3 text-gray-500">{p.areaHectares} ha</td>
                  <td className="px-5 py-3 text-gray-400">{p.subPlots?.length || '—'}</td>
                  <td className="px-3 py-3">
                    <RowActions actions={rowActions(p)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-3 md:hidden">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
              <button type="button" onClick={() => setDetail(p)} className="min-w-0 flex-1 text-left">
                <p className="truncate font-semibold text-gray-900">{p.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">{p.sector.name} · {p.areaHectares} ha</p>
                <p className="mt-0.5 truncate text-xs text-gray-400">{p.ownerUser?.fullName}</p>
              </button>
              <RowActions actions={rowActions(p)} />
            </div>
          ))}
        </div>
      )}

      <PlotFormModal
        open={showForm.active}
        onClose={showForm.off}
        onSaved={handleSaved}
        plot={editTarget}
        sectors={sectors}
        users={users}
        defaultSectorId={sectorFilter}
      />

      {detail && (
        <PlotDetailPanel
          plot={detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            openEdit(detail);
          }}
          onDelete={() => handleDelete(detail)}
        />
      )}
    </div>
  );
};

export default ParcelasPage;
