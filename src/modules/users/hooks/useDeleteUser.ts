'use client';

import { toast } from 'react-toastify';
import useRequest from '@/@common/hooks/useRequest';
import { deleteUserRequest } from '../services/user.service';

/** Deletes a user by id. Shows a success toast on completion. */
export const useDeleteUser = () => {
  const { loading, handler } = useRequest<void, [string]>(
    false,
    async (id) => {
      await deleteUserRequest(id);
      toast.success('Usuario eliminado');
    },
  );

  return { loading, handler };
};
