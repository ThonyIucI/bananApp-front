'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { Modal } from '@/@common/components/modals/Modal';
import { ConfirmCloseDialog } from '@/@common/components/modals/ConfirmCloseDialog';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { useDebounce } from '@/@common/hooks/useDebounce';
import { useListPlots } from '@/modules/plots/hooks/useListPlots';
import { useListUserPlots } from '@/modules/users/hooks/useListUserPlots';
import { useAssignUserPlots } from '@/modules/users/hooks/useAssignUserPlots';
import { useUnassignUserPlots } from '@/modules/users/hooks/useUnassignUserPlots';
import { Checkbox } from '@/components/ui/checkbox';
import type { UserResponse } from '@/modules/users/services/user.service';

interface AssignPlotsModalProps {
  user: UserResponse;
  cooperativeId: string;
  onClose: () => void;
  /** Called with the final set of assigned plot IDs on success. */
  onAssigned: (plotIds: string[]) => void;
}

/**
 * Modal for managing a user's active plot assignments within a cooperative.
 * Calculates a diff on submit and calls assign/unassign endpoints in parallel.
 */
export const AssignPlotsModal = ({
  user,
  cooperativeId,
  onClose,
  onAssigned,
}: AssignPlotsModalProps) => {
  const showConfirm = useBoolean();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());

  const ListPlots = useListPlots();
  const ListUserPlots = useListUserPlots();
  const AssignPlots = useAssignUserPlots();
  const UnassignPlots = useUnassignUserPlots();

  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    ListPlots.handler({ cooperativeId, limit: 100 });
    ListUserPlots.handler({ userId: user.id, cooperativeId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, cooperativeId]);

  useEffect(() => {
    if (!ListUserPlots.data) return;
    const ids = new Set(ListUserPlots.data.map((up) => up.plot.id));
    setSelectedIds(ids);
    setInitialIds(ids);
  }, [ListUserPlots.data]);

  const availablePlots = useMemo(() => {
    const plots = ListPlots.data?.items ?? [];
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return plots;
    return plots.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sector as { name: string }).name?.toLowerCase().includes(q),
    );
  }, [ListPlots.data, debouncedSearch]);

  const isDirty = useMemo(() => {
    if (selectedIds.size !== initialIds.size) return true;
    for (const id of selectedIds) {
      if (!initialIds.has(id)) return true;
    }
    return false;
  }, [selectedIds, initialIds]);

  const isLoading = AssignPlots.loading || UnassignPlots.loading;
  const isDataLoading = ListPlots.loading || ListUserPlots.loading;

  const tryClose = () => (isDirty ? showConfirm.on() : onClose());

  const togglePlot = (plotId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(plotId)) {
        next.delete(plotId);
      } else {
        next.add(plotId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const allIds = availablePlots.map((p) => p.id);
    setSelectedIds((prev) => new Set([...prev, ...allIds]));
  };

  const clearAll = () => {
    const allIds = new Set(availablePlots.map((p) => p.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of allIds) next.delete(id);
      return next;
    });
  };

  const onSubmit = async () => {
    const toAssign = availablePlots
      .map((p) => p.id)
      .filter((id) => selectedIds.has(id) && !initialIds.has(id));

    const toUnassign = availablePlots
      .map((p) => p.id)
      .filter((id) => !selectedIds.has(id) && initialIds.has(id));

    if (toAssign.length === 0 && toUnassign.length === 0) {
      onClose();
      return;
    }

    await Promise.all([
      toAssign.length > 0
        ? AssignPlots.handler(user.id, { cooperativeId, plotIds: toAssign })
        : Promise.resolve(null),
      toUnassign.length > 0
        ? UnassignPlots.handler(user.id, { cooperativeId, plotIds: toUnassign })
        : Promise.resolve(null),
    ]);

    toast.success('Asignaciones de parcelas actualizadas');
    onAssigned([...selectedIds]);
    onClose();
  };

  const selectedCount = selectedIds.size;

  return (
    <>
      <Modal
        open
        onClose={tryClose}
        title="Asignar parcelas"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={tryClose}
              disabled={isLoading}
              className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-[transform,background-color] duration-160 ease-out hover:bg-gray-50 active:scale-[0.97] disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isLoading || !isDirty}
              className="cursor-pointer rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-160 ease-out hover:bg-[#219a52] active:scale-[0.97] disabled:opacity-60"
            >
              {isLoading ? 'Guardando…' : `Guardar (${selectedCount})`}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-400">{user.fullName}</p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o sector…"
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#27ae60] focus:ring-2 focus:ring-[#27ae60]/20"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {availablePlots.length} parcela{availablePlots.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={selectAll}
                className="cursor-pointer text-xs font-medium text-[#27ae60] hover:underline"
              >
                Seleccionar todas
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="cursor-pointer text-xs font-medium text-gray-400 hover:underline"
              >
                Quitar todas
              </button>
            </div>
          </div>

          {isDataLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#27ae60] border-t-transparent" />
            </div>
          )}

          {!isDataLoading && availablePlots.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-8">
              <MapPin className="mb-2 h-7 w-7 text-gray-300" strokeWidth={1.2} />
              <p className="text-sm text-gray-400">Sin parcelas disponibles</p>
            </div>
          )}

          {!isDataLoading && availablePlots.length > 0 && (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
              {availablePlots.map((plot) => {
                const sector = plot.sector as { name: string };
                const isChecked = selectedIds.has(plot.id);
                return (
                  <label
                    key={plot.id}
                    htmlFor={`plot-${plot.id}`}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`plot-${plot.id}`}
                      checked={isChecked}
                      onCheckedChange={() => togglePlot(plot.id)}
                      className="border-gray-300 data-[state=checked]:border-[#27ae60] data-[state=checked]:bg-[#27ae60]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{plot.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {sector.name} · {plot.areaHectares} ha
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {showConfirm.active && (
        <ConfirmCloseDialog
          onConfirm={() => {
            showConfirm.off();
            onClose();
          }}
          onCancel={showConfirm.off}
        />
      )}
    </>
  );
};
