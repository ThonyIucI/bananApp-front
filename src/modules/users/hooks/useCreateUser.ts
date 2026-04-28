'use client';

import useRequest from '@/@common/hooks/useRequest';
import {
  createUserRequest,
  type UserResponse,
  type CreateUserPayload,
} from '../services/user.service';
import { toast } from 'react-toastify';

export function useCreateUser() {
  const { loading, data, handler } = useRequest<UserResponse, [CreateUserPayload]>(
    false,
    async (payload) => {
      const result = await createUserRequest(payload);
      toast.success(`Usuario "${result.fullName}" creado correctamente`);
      return result;
    },
  );

  return { loading, data, handler };
}
