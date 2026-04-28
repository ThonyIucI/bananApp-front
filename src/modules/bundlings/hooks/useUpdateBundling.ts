'use client';

import useRequest from '@/@common/hooks/useRequest';
import { toast } from 'react-toastify';
import {
  updateBundlingRequest,
  type BundlingResponse,
  type UpdateBundlingPayload,
} from '../services/bundling.service';

type Args = [id: string, payload: UpdateBundlingPayload, cooperativeId?: string];

/** Updates a bundling record by id. Requires cooperativeId for the permission guard. */
export const useUpdateBundling = () => {
  const { loading, handler } = useRequest<BundlingResponse, Args>(
    false,
    async (id, payload, cooperativeId) => {
      const result = await updateBundlingRequest(id, payload, cooperativeId);
      toast.success('Enfunde actualizado correctamente');
      return result;
    },
  );

  return { loading, handler };
};
