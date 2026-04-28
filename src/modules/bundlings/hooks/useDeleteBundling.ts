'use client';

import useRequest from '@/@common/hooks/useRequest';
import { toast } from 'react-toastify';
import { deleteBundlingRequest } from '../services/bundling.service';

type Args = [id: string, cooperativeId?: string];

/** Soft-deletes a bundling record. Requires cooperativeId for the permission guard. */
export const useDeleteBundling = () => {
  const { loading, handler } = useRequest<void, Args>(
    false,
    async (id, cooperativeId) => {
      await deleteBundlingRequest(id, cooperativeId);
      toast.success('Enfunde eliminado');
    },
  );

  return { loading, handler };
};
