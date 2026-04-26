'use client';

import { toast } from 'react-toastify';
import useRequest from '@/@common/hooks/useRequest';
import { deleteCooperativeRequest } from '../services/cooperative.service';

/** Deletes a cooperative by id. Shows a success toast on completion. */
export const useDeleteCooperative = () => {
  const { loading, handler } = useRequest<void, [string]>(
    false,
    async (id) => {
      await deleteCooperativeRequest(id);
      toast.success('Cooperativa eliminada');
    },
  );

  return { loading, handler };
};
