'use client';

import useRequest from '@/@common/hooks/useRequest';
import {
  listUserPlotsRequest,
  type UserPlotResponse,
} from '../services/user-plot.service';

export interface ListUserPlotsArgs {
  userId: string;
  cooperativeId: string;
}

/**
 * Lists active plot assignments for a user scoped to a cooperative.
 */
export const useListUserPlots = () => {
  const { loading, data, handler, setData } = useRequest<UserPlotResponse[], [ListUserPlotsArgs]>(
    false,
    async (args) =>
      listUserPlotsRequest(args.userId, args.cooperativeId),
  );

  const onUpsert = (item: UserPlotResponse) => {
    setData((prev) =>
      prev
        ? prev.some((p) => p.id === item.id)
          ? prev.map((p) => (p.id === item.id ? item : p))
          : [item, ...prev]
        : prev,
    );
  };

  const onRemove = (id: string) => {
    setData((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
  };

  return { loading, data, handler, onUpsert, onRemove };
};
