'use client';

import useRequest from '@/@common/hooks/useRequest';
import { enqueueBundling } from '@/lib/offline/sync-manager';
import { toast } from 'react-toastify';
import {
  createBundlingRequest,
  type CreateBundlingPayload,
  type BundlingResponse,
} from '../services/bundling.service';
import { todayIso } from '@/@common/utils/date';

/**
 * Creates a bundling record.
 *
 * When online: calls the API directly and stores the result in the sync queue
 * as 'synced' (for offline history display).
 *
 * When offline (or on network failure): enqueues the payload as 'pending'
 * and shows a tactile + visual confirmation to the user.
 */
export function useCreateBundling() {
  const { loading, handler } = useRequest(
    false,
    async (payload: CreateBundlingPayload) => {
      const isOnline = navigator.onLine;

      if (!isOnline) {
        await createOfflineBundling(payload);
        return buildOfflineResponse(payload);
      }

      return await createOnlineBundling(payload);
    },
  );

  return { loading, handler };
}

/** Builds a synthetic BundlingResponse from an offline payload for optimistic UI. */
const buildOfflineResponse = (payload: CreateBundlingPayload): BundlingResponse => ({
  id: payload.localUuid ?? '',
  quantity: payload.quantity ?? 0,
  bundledAt: payload.bundledAt,
  ribbonColorFree: payload.ribbonColorFree ?? null,
  ribbonCalendar: null,
  notes: payload.notes ?? null,
  localUuid: payload.localUuid ?? '',
  syncedAt: null,
  createdAt: todayIso(),
  plot: { id: payload.plotId, name: '' },
  subPlot: null,
  enfundadorUser: { id: payload.enfundadorUserId ?? '', fullName: '' },
});

const createOfflineBundling = async (payload: CreateBundlingPayload): Promise<void> => {
  await enqueueBundling({
    localUuid: payload.localUuid??'',
    payload,
    status: 'pending',
    attempts: 0,
    createdAt: todayIso(),
  });
  navigator.vibrate?.(200);
  toast.info('Guardado offline. Se sincronizará al volver la conexión.', { autoClose: 5000 });   
};

const createOnlineBundling = async (payload: CreateBundlingPayload): Promise<BundlingResponse> => {
  const result = await createBundlingRequest(payload);
  toast.success(`${result?.data?.quantity ?? 0} fundas contabilizadas`, { autoClose: 5000 });
  return result.data;
};
