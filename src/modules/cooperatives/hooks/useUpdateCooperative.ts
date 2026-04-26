import { toast } from 'react-toastify';
import useRequest from '@/@common/hooks/useRequest';
import {
  updateCooperativeRequest,
  type CooperativeResponse,
  type UpdateCooperativePayload,
} from '../services/cooperative.service';

export const useUpdateCooperative = () => {
  const { loading, handler } = useRequest<CooperativeResponse, [string, UpdateCooperativePayload]>(
    false,
    async (id, payload) => {
      const result = await updateCooperativeRequest(id, payload);
      toast.success('Cooperativa actualizada');
      return result;
    },
  );
  return { loading, handler };
};
