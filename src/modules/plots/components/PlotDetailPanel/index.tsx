'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DetailPanel } from '@/@common/components/DetailPanel';
import { formatDate } from '@/@common/utils/date';
import type { PlotResponse } from '../../services/plot.service';

interface PlotDetailPanelProps {
  plot: PlotResponse;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Slide-in panel showing full plot info and internal subPlots. */
export const PlotDetailPanel = ({ plot, onClose, onEdit, onDelete }: PlotDetailPanelProps) => (
  <DetailPanel
    title={plot.name}
    subtitle={plot.sector.name}
    onClose={onClose}
    headerActions={
      <>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onEdit} title="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          title="Eliminar"
          className="hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </>
    }
  >
    <div className="space-y-4">
      <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100">
        {([
          { label: 'Sector', value: plot.sector.name },
          { label: 'Cooperativa', value: plot.sector?.cooperative?.name },
          { label: 'Propietario', value: plot.ownerUser?.fullName },
          ...(plot.workerUser ? [{ label: 'Arrendatario', value: plot.workerUser.fullName }] : []),
          { label: 'Área', value: `${plot.areaHectares} ha` },
          { label: 'Código catastral', value: plot.cadastralCode ?? '—' },
          { label: 'Registrada', value: formatDate(plot.createdAt) },
        ] as { label: string; value: string }[]).map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between px-4 py-3">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="ml-4 text-right text-sm font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      {(plot.subPlots ?? []).length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Lotes internos ({(plot.subPlots ?? []).length})
          </p>
          <div className="space-y-2">
            {(plot.subPlots ?? []).map((m) => (
              <div key={m.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                <p className="text-sm font-medium text-gray-900">{m.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {m.areaHectares} ha{m.responsibleUser ? ` · ${m.responsibleUser.fullName}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </DetailPanel>
);
