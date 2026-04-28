'use client';

import useRequest from '@/@common/hooks/useRequest';
import {
  unassignUserPlotsRequest,
  type UnassignUserPlotsPayload,
} from '../services/user-plot.service';

type Args = [userId: string, payload: UnassignUserPlotsPayload];

/**
 * Removes plot assignments from a user (soft-unassign).
 */
export const useUnassignUserPlots = () => {
  const { loading, handler } = useRequest<void, Args>(
    false,
    async (userId, payload) => {
      await unassignUserPlotsRequest(userId, payload);
    },
  );

  return { loading, handler };
};
