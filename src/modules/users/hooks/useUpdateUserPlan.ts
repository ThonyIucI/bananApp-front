import { toast } from 'react-toastify';
import useRequest from '@/@common/hooks/useRequest';
import { updateUserRequest, type UserResponse, type EGaiaPlan } from '@/modules/users/services/user.service';

/** Updates the GaIA subscription plan for a given user. */
export const useUpdateUserPlan = () => {
  const { loading, handler } = useRequest<UserResponse, [string, EGaiaPlan]>(
    false,
    async (id, subscriptionTier) => {
      const result = await updateUserRequest(id, { subscriptionTier });
      toast.success('Plan actualizado');
      return result;
    },
  );
  return { loading, handler };
};
