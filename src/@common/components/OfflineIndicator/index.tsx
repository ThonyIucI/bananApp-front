'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/lib/offline/hooks/useOnlineStatus';
import { usePendingSync } from '@/lib/offline/hooks/usePendingSync';
import { getQueuedBundlings } from '@/lib/offline/sync-manager';
import type { QueuedBundling } from '@/lib/offline/db';
import { PendingBundlingsPanel } from './PendingBundlingsPanel';
import { useBoolean } from '@/@common/hooks/useBoolean';

/**
 * Floating pill showing connectivity and pending sync count.
 * Clicking it opens the PendingBundlingsPanel when there are pending/failed items.
 */
export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const isMounted=useBoolean()
  const { pendingCount, failedCount, isSyncing, syncNow } = usePendingSync();
  const [panelOpen, setPanelOpen] = useState(false);
  const [queuedItems, setQueuedItems] = useState<QueuedBundling[]>([]);

  const totalPending = pendingCount + failedCount;
  
  useEffect(() => {
    isMounted.on();
  }, []);

  const refreshQueue = () => {
    getQueuedBundlings()
      .then((all) => setQueuedItems(all.filter((q) => q.status === 'pending' || q.status === 'failed')))
      .catch(() => {});
  };

  useEffect(() => {
    if (panelOpen) refreshQueue();
  }, [panelOpen, pendingCount, failedCount]);

  if (isOnline && totalPending === 0) return null;

  const colorClass = !isOnline
    ? 'bg-red-500 text-white'
    : failedCount > 0
      ? 'bg-amber-500 text-white'
      : 'bg-amber-400 text-white';

  const label = !isOnline
    ? 'Sin conexión'
    : `${totalPending} pendiente${totalPending !== 1 ? 's' : ''}`;

  const Icon = isOnline ? Wifi : WifiOff;

  const handlePillClick = () => {
    if (totalPending > 0) setPanelOpen((v) => !v);
  };

  if (!isMounted.active) return null;

  if (isOnline && totalPending === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-lg ${colorClass} transition-all duration-300 ${totalPending > 0 ? 'cursor-pointer' : ''}`}
          onClick={handlePillClick}
          role={totalPending > 0 ? 'button' : undefined}
          aria-expanded={panelOpen}
          aria-label={totalPending > 0 ? 'Ver registros pendientes' : undefined}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold">{label}</span>

          {isOnline && totalPending > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); syncNow(); }}
              disabled={isSyncing}
              className="ml-1 flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium transition hover:bg-white/30 disabled:opacity-60"
              aria-label="Sincronizar ahora"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando…' : 'Sincronizar'}
            </button>
          )}
        </div>

        {panelOpen && totalPending > 0 && (
          <PendingBundlingsPanel
            items={queuedItems}
            onChanged={() => { refreshQueue(); }}
          />
        )}
      </div>
    </div>
  );
};
