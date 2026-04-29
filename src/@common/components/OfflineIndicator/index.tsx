'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/lib/offline/hooks/useOnlineStatus';
import { usePendingSync } from '@/lib/offline/hooks/usePendingSync';
import { useBoolean } from '@/@common/hooks/useBoolean';import { useEffect } from 'react';

/**
 * Floating pill that shows connectivity status and pending sync count.
 *
 * - Green  : online, nothing pending
 * - Amber  : online, items pending sync
 * - Red    : offline
 *
 * Rendered in `(app)/layout.tsx` so it's visible on all authenticated pages.
 */
export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const isMounted=useBoolean()
  const { pendingCount, failedCount, isSyncing, syncNow } = usePendingSync();

  const totalPending = pendingCount + failedCount;
  
  useEffect(() => {
    isMounted.on();
  }, []);

  // Nothing to show: online and nothing to sync
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

  if (!isMounted.active) return null;

  if (isOnline && totalPending === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 shadow-lg ${colorClass} transition-all duration-300`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-xs font-semibold">{label}</span>

        {isOnline && totalPending > 0 && (
          <button
            onClick={syncNow}
            disabled={isSyncing}
            className="ml-1 flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium transition hover:bg-white/30 disabled:opacity-60"
            aria-label="Sincronizar ahora"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando…' : 'Sincronizar'}
          </button>
        )}
      </div>
    </div>
  );
};
