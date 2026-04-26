'use client';

import useRequest from '@/@common/hooks/useRequest';
import {
  assignUserPlotsRequest,
  type AssignUserPlotsPayload,
  type UserPlotResponse,
} from '../services/user-plot.service';

type Args = [userId: string, payload: AssignUserPlotsPayload];

/**
 * Assigns plots to a user (idempotent).
 * Caller is responsible for showing the success toast.
 */
export const useAssignUserPlots = () => {
  const { loading, handler } = useRequest<UserPlotResponse[], Args>(
    false,
    async (userId, payload) => assignUserPlotsRequest(userId, payload),
  );

  return { loading, handler };
};
