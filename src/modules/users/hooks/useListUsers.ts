'use client';

import useRequest from '@/@common/hooks/useRequest';
import { listUsersRequest, type UserResponse } from '../services/user.service';
import type { PaginatedResponse } from '@/@common/types/api.types';

/** List users with optimistic insert/update/remove helpers. */
export const useListUsers = () => {
  const { loading, data, handler, setData } = useRequest(
    false,
    async () => listUsersRequest(),
  );

  const onUpsert = (item: UserResponse) =>
    setData((prev: PaginatedResponse<UserResponse> | null) => {
      if (!prev) return { items: [item], total: 1, limit: 50, offset: 0 };
      const idx = prev.items.findIndex((x) => x.id === item.id);
      const items =
        idx >= 0
          ? prev.items.map((x) => (x.id === item.id ? item : x))
          : [item, ...prev.items];
      return { ...prev, items, total: idx >= 0 ? prev.total : prev.total + 1 };
    });

  const onRemove = (id: string) =>
    setData((prev: PaginatedResponse<UserResponse> | null) =>
      prev
        ? { ...prev, items: prev.items.filter((x) => x.id !== id), total: prev.total - 1 }
        : prev,
    );

  return { loading, data, handler, onUpsert, onRemove };
};
