'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DetailPanel } from '@/@common/components/DetailPanel';
import { listPlotsRequest, type PlotResponse } from '@/modules/plots/services/plot.service';
import { formatDate } from '@/@common/utils/date';
import type { SectorResponse } from '../../services/sector.service';

interface SectorDetailPanelProps {
  sector: SectorResponse;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Slide-in panel showing plots belonging to a sector, with edit/delete header actions. */
export const SectorDetailPanel = ({ sector, onClose, onEdit, onDelete }: SectorDetailPanelProps) => {
  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [loadingPlots, setLoadingPlots] = useState(true);

  useEffect(() => {
    setLoadingPlots(true);
    listPlotsRequest({ sectorId: sector.id, limit: 100 })
      .then((r) => setPlots(r.items))
      .finally(() => setLoadingPlots(false));
  }, [sector.id]);

  return (
    <DetailPanel
      title={sector.name}
      subtitle={formatDate(sector.createdAt)}
      onClose={onClose}
      headerActions={
        <>
          <Button type="button" variant="ghost" size="icon" onClick={onEdit} title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            title="Eliminar"
            className="hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Parcelas</p>
      {loadingPlots && (
        <div className="flex justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#27ae60] border-t-transparent" />
        </div>
      )}
      {!loadingPlots && plots.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400">
          Sin parcelas en este sector
        </p>
      )}
      {!loadingPlots && plots.length > 0 && (
        <div className="space-y-2">
          {plots.map((p) => (
            <div key={p.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
              <p className="text-sm font-medium text-gray-900">{p.name}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {p.areaHectares} ha · {p.ownerUser?.fullName}
              </p>
              {(p.subPlots ?? []).length > 0 && (
                <p className="mt-0.5 text-xs text-gray-400">
                  {(p.subPlots ?? []).length} lote{(p.subPlots ?? []).length !== 1 ? 's' : ''} interno{(p.subPlots ?? []).length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </DetailPanel>
  );
};
