import { toast } from 'react-toastify';
import useRequest from '@/@common/hooks/useRequest';
import { updateUserRequest, type UserResponse, type UpdateUserPayload } from '../services/user.service';

export const useUpdateUser = () => {
  const { loading, handler } = useRequest<UserResponse, [string, UpdateUserPayload]>(
    false,
    async (id, payload) => {
      const result = await updateUserRequest(id, payload);
      toast.success('Usuario actualizado');
      return result;
    },
  );
  return { loading, handler };
};
