'use client';

import useRequest from '@/@common/hooks/useRequest';
import { enqueueBundling } from '@/lib/offline/sync-manager';
import { toast } from 'react-toastify';
import {
  createBundlingRequest,
  type CreateBundlingPayload,
  type BundlingResponse,
} from '../services/bundling.service';

/**
 * Creates a bundling record.
 *
 * When online: calls the API directly and stores the result in the sync queue
 * as 'synced' (for offline history display).
 *
 * When offline (or on network failure): enqueues the payload as 'pending'
 * and shows a tactile + visual confirmation to the user.
 */
export function useCreateBundling(): {
  loading: boolean;
  handler: (payload: CreateBundlingPayload) => Promise<BundlingResponse | null>;
} {
  const { loading, handler } = useRequest<BundlingResponse, [CreateBundlingPayload]>(
    false,
    async (payload) => {
      const isOnline = navigator.onLine;

      if (!isOnline) {
        await enqueueBundling({
          localUuid: payload.localUuid,
          payload,
          status: 'pending',
          attempts: 0,
          createdAt: new Date().toISOString(),
        });

        navigator.vibrate?.(200);
        toast.info('Guardado offline. Se sincronizará al volver la conexión.', { autoClose: 5000 });

        // Return a synthetic response so the calling component can do optimistic UI
        return buildOfflineResponse(payload);
      }

      try {
        const result = await createBundlingRequest(payload);

        // Store in queue as synced — lets the offline-first list show today's records
        await enqueueBundling({
          localUuid: payload.localUuid,
          payload,
          status: 'synced',
          attempts: 0,
          createdAt: new Date().toISOString(),
          syncedAt: new Date().toISOString(),
        }).catch(() => {});

        toast.success(
          `Enfunde registrado: ${result.quantity} fundas en ${result.plot.name}`,
          { autoClose: 5000 },
        );
        return result;
      } catch {
        // Network failure while online — queue as pending and inform user
        await enqueueBundling({
          localUuid: payload.localUuid,
          payload,
          status: 'pending',
          attempts: 0,
          createdAt: new Date().toISOString(),
        });

        navigator.vibrate?.(200);
        toast.info('Error de red. Enfunde guardado localmente y se sincronizará pronto.', {
          autoClose: 6000,
        });
        return buildOfflineResponse(payload);
      }
    },
  );

  return { loading, handler };
}

/** Builds a synthetic BundlingResponse from an offline payload for optimistic UI. */
const buildOfflineResponse = (payload: CreateBundlingPayload): BundlingResponse => ({
  id: payload.localUuid,
  quantity: payload.quantity,
  bundledAt: payload.bundledAt,
  ribbonColorFree: payload.ribbonColorFree ?? null,
  ribbonCalendar: null,
  notes: payload.notes ?? null,
  localUuid: payload.localUuid,
  syncedAt: null,
  createdAt: new Date().toISOString(),
  plot: { id: payload.plotId, name: '' },
  subPlot: null,
  enfundadorUser: { id: payload.enfundadorUserId, fullName: '' },
});
