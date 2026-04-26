'use client';

import useRequest from '@/@common/hooks/useRequest';
import {
  assignUserCooperativeRequest,
  type AssignCooperativePayload,
} from '../services/user.service';
import { toast } from 'react-toastify';

type Args = [userId: string, payload: AssignCooperativePayload];

export function useAssignUserCooperative() {
  const { loading, handler } = useRequest<void, Args>(
    false,
    async (userId, payload) => {
      await assignUserCooperativeRequest(userId, payload);
      toast.success('Usuario asignado a cooperativa correctamente');
    },
  );

  return { loading, handler };
}
