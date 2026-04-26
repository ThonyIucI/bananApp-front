'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuthContext } from '@/modules/auth/context/auth.context';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { useListSectors } from '@/modules/sectors/hooks/useListSectors';
import { useDeleteSector } from '@/modules/sectors/hooks/useDeleteSector';
import { useListUsers } from '@/modules/users/hooks/useListUsers';
import { SectorFormModal } from '@/modules/sectors/components/SectorFormModal';
import { SectorDetailPanel } from '@/modules/sectors/components/SectorDetailPanel';
import { RowActions } from '@/@common/components/RowActions';
import { formatDate } from '@/@common/utils/date';
import type { SectorResponse } from '@/modules/sectors/services/sector.service';

/** Sector list page — create, edit, delete sectors. Click row to see its plots. */
const SectoresPage = () => {
  const { user } = useAuthContext();
  const cooperativeId = user?.cooperatives?.[0]?.cooperativeId ?? '';

  const ListSectors = useListSectors();
  const ListUsers = useListUsers();
  const DeleteSector = useDeleteSector();
  const showForm = useBoolean();

  const sectorList = ListSectors.data ?? [];
  const users = ListUsers.data?.items ?? [];
  const [editTarget, setEditTarget] = useState<SectorResponse | undefined>();
  const [detail, setDetail] = useState<SectorResponse | null>(null);

  useEffect(() => {
    if (!cooperativeId) return;
    ListSectors.handler(cooperativeId);
    ListUsers.handler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooperativeId]);

  const handleSaved = (s: SectorResponse) => {
    ListSectors.onUpsert(s);
  };

  const handleDelete = async (s: SectorResponse) => {
    if (!confirm(`¿Eliminar sector "${s.name}"? Las parcelas asociadas también serán eliminadas.`)) return;
    await DeleteSector.handler(s.id);
    ListSectors.onRemove(s.id);
    if (detail?.id === s.id) setDetail(null);
  };

  const openCreate = () => {
    setEditTarget(undefined);
    showForm.on();
  };

  const openEdit = (s: SectorResponse) => {
    setEditTarget(s);
    showForm.on();
  };

  const rowActions = (s: SectorResponse) => [
    { icon: Pencil, label: 'Editar', onClick: () => openEdit(s), inline: true },
    { icon: Trash2, label: 'Eliminar', onClick: () => handleDelete(s), variant: 'destructive' as const },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sectores</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {sectorList.length} sector{sectorList.length !== 1 ? 'es' : ''} registrado{sectorList.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white shadow-sm transition-[transform,background-color] duration-160 ease-out hover:bg-[#219a52] active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          Nuevo sector
        </button>
      </div>

      {ListSectors.loading && sectorList.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#27ae60] border-t-transparent" />
        </div>
      )}

      {!ListSectors.loading && sectorList.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16">
          <p className="text-sm font-medium text-gray-500">Ningún sector registrado</p>
          <p className="mt-1 text-xs text-gray-400">Crea el primero usando el botón superior</p>
        </div>
      )}

      {sectorList.length > 0 && (
        <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Sector</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Creado</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sectorList.map((s) => (
                <tr key={s.id} onClick={() => setDetail(s)} className="cursor-pointer transition-colors hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-5 py-3 text-gray-400">{formatDate(s.createdAt)}</td>
                  <td className="px-3 py-3">
                    <RowActions actions={rowActions(s)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sectorList.length > 0 && (
        <div className="space-y-3 md:hidden">
          {sectorList.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
              <button type="button" onClick={() => setDetail(s)} className="min-w-0 flex-1 text-left">
                <p className="truncate font-semibold text-gray-900">{s.name}</p>
                <p className="mt-0.5 text-xs text-gray-400">{formatDate(s.createdAt)}</p>
              </button>
              <RowActions actions={rowActions(s)} />
            </div>
          ))}
        </div>
      )}

      <SectorFormModal
        open={showForm.active}
        onClose={showForm.off}
        onSaved={handleSaved}
        sector={editTarget}
        users={users}
      />

      {detail && (
        <SectorDetailPanel
          sector={detail}
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

export default SectoresPage;
