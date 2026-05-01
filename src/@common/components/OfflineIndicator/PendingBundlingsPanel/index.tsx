'use client';

import { RotateCcw, Trash2, Clock, AlertCircle, WifiOff } from 'lucide-react';
import { retryItem, removeItem } from '@/lib/offline/sync-manager';
import { useConfirmModal } from '@/@common/hooks/useConfirmModal';
import type { QueuedBundling } from '@/lib/offline/db';
import { formatDate } from '@/@common/utils/date';
import { RIBBON_COLOR_LABELS } from '@/@common/constants/ribbon-colors';
import type { RibbonColor } from '@/@common/constants/ribbon-colors';

interface PendingBundlingsPanelProps {
  items: QueuedBundling[];
  onChanged: () => void;
}

const STATUS_BADGE: Record<string, { label: string; className: string; Icon: typeof Clock }> = {
  pending: { label: 'Esperando sync', className: 'bg-amber-100 text-amber-700', Icon: Clock },
  network: { label: 'Error de conexión', className: 'bg-red-100 text-red-600', Icon: WifiOff },
  backend: { label: 'Error del servidor', className: 'bg-red-200 text-red-700', Icon: AlertCircle },
  unknown: { label: 'Error desconocido', className: 'bg-gray-100 text-gray-600', Icon: AlertCircle },
};

const getBadgeKey = (item: QueuedBundling): string => {
  if (item.status === 'failed') return item.errorKind ?? 'unknown';
  return 'pending';
};

/**
 * Panel listing pending/failed bundlings with per-item retry and delete actions.
 * Rendered inside the OfflineIndicator dropdown.
 */
export const PendingBundlingsPanel = ({ items, onChanged }: PendingBundlingsPanelProps) => {
  const { confirm, dialog } = useConfirmModal();

  const handleRetry = async (localUuid: string) => {
    await retryItem(localUuid);
    onChanged();
  };

  const handleDelete = async (item: QueuedBundling) => {
    const ok = await confirm({
      title: '¿Eliminar enfunde pendiente?',
      description: 'Los datos de este registro se perderán permanentemente y no se enviarán al servidor.',
      confirmLabel: 'Eliminar',
      variant: 'destructive',
    });
    if (!ok) return;
    await removeItem(item.localUuid);
    onChanged();
  };

  if (!items.length) return null;

  return (
    <>
      <div className="mt-2 w-80 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="border-b border-gray-100 px-3 py-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Registros pendientes ({items.length})
          </p>
        </div>

        <ul className="divide-y divide-gray-50">
          {items.map((item) => {
            const badgeKey = getBadgeKey(item);
            const badge = STATUS_BADGE[badgeKey] ?? STATUS_BADGE.unknown;
            const BadgeIcon = badge.Icon;
            const color = item.payload.ribbonColorFree
              ? RIBBON_COLOR_LABELS[item.payload.ribbonColorFree as RibbonColor]
              : null;
            const isTerminal = item.errorKind === 'backend';

            return (
              <li key={item.localUuid} className="px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-800">
                      {(item.payload.quantity ?? 0).toLocaleString()} fundas
                      {color && <span className="text-gray-500"> · {color}</span>}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {formatDate(item.payload.bundledAt)}
                      {item.attempts > 0 && (
                        <span className="ml-1">· {item.attempts} intento{item.attempts !== 1 ? 's' : ''}</span>
                      )}
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}
                    >
                      <BadgeIcon className="h-2.5 w-2.5" />
                      {badge.label}
                      {isTerminal && item.lastError && (
                        <span className="ml-0.5 truncate max-w-32">: {item.lastError}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRetry(item.localUuid)}
                      aria-label="Reintentar"
                      title="Reintentar"
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      aria-label="Eliminar"
                      title="Eliminar"
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {dialog}
    </>
  );
};
