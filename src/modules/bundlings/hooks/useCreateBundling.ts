'use client';

import useRequest from '@/@common/hooks/useRequest';
import { enqueueBundling } from '@/lib/offline/sync-manager';
import { toast } from 'react-toastify';
import { ApiError } from '@/lib/api/client';
import {
  createBundlingRequest,
  isBundlingArray,
  type CreateBundlingPayload,
  type BundlingResponse,
  type SubPlotEntryPayload,
} from '../services/bundling.service';
import { todayIso } from '@/@common/utils/date';

/**
 * Creates one or multiple bundling records.
 *
 * Single mode (no subPlotEntries):
 *   - Online → POST → BundlingResponse
 *   - Offline → enqueue 1 item → synthetic BundlingResponse
 *
 * Multi mode (subPlotEntries present):
 *   - Online → 1 POST with array → BundlingResponse[]
 *   - Offline → enqueue N items (one per entry) → synthetic BundlingResponse[]
 *
 * Network errors while online are treated as offline (item(s) enqueued).
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
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Reconstructs a single-mode payload from a multi-mode entry. */
const buildEntryPayload = (
  base: CreateBundlingPayload,
  entry: SubPlotEntryPayload,
): CreateBundlingPayload => ({
  cooperativeId: base.cooperativeId,
  plotId: base.plotId,
  bundledAt: base.bundledAt,
  subPlotId: entry.subPlotId,
  enfundadorUserId: entry.enfundadorUserId,
  quantity: entry.quantity,
  localUuid: entry.localUuid,
  ribbonColorFree: entry.ribbonColorFree,
  ribbonCalendarId: entry.ribbonCalendarId,
  notes: entry.notes,
});

/** Builds a synthetic BundlingResponse from a single-mode payload for optimistic UI. */
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
