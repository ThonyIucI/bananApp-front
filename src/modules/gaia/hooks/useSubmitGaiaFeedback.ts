import useRequest from '@/@common/hooks/useRequest';
import { submitGaiaFeedbackRequest } from '../services/gaia.service';

/**
 * Sends 👍/👎 feedback for a GaIA response to the analytics backend.
 * Errors are handled silently (feedback failure must not disrupt the chat UX).
 */
export const useSubmitGaiaFeedback = () => {
  const { loading, handleRequest } = useRequest(false);

  const handler = async (queryId: string, helpful: boolean): Promise<boolean> => {
    const result = await handleRequest(
      async () => {
        await submitGaiaFeedbackRequest(queryId, { helpful });
        return true;
      },
      () => {
        // Feedback errors are non-critical — swallow silently, no toast
      },
    );
    return !!result;
  };

  return { loading, handler };
};
