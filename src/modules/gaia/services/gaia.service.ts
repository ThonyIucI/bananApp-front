import { apiClient } from '@/lib/api/client';

export type TGaiaMessageRole = 'user' | 'assistant';

export interface IGaiaHistoryMessage {
  role: TGaiaMessageRole;
  text: string;
}

export interface IGaiaPendingAction {
  tool: string;
  payload: Record<string, unknown>;
  humanSummary: string;
}

export interface IGaiaUsageInfo {
  remaining: number;
  limit: number;
}

export interface SendGaiaMessagePayload {
  text: string;
  history?: IGaiaHistoryMessage[];
}

export interface IGaiaMessageResponse {
  reply: { text: string };
  pendingAction: IGaiaPendingAction | null;
  /** Analytics record ID — null if backend persistence failed (non-critical) */
  queryId: string | null;
  usage: IGaiaUsageInfo;
}

export interface IGaiaFeedbackPayload {
  helpful: boolean;
}

/** Sends a text message to GaIA and returns the AI response with usage info. */
export const sendGaiaMessageRequest = (payload: SendGaiaMessagePayload) =>
  apiClient.post<IGaiaMessageResponse>('/gaia/messages', payload);

/** Registers explicit user feedback (helpful / not helpful) on a GaIA response. */
export const submitGaiaFeedbackRequest = (id: string, payload: IGaiaFeedbackPayload) =>
  apiClient.post<void>(`/gaia/queries/${id}/feedback`, payload);
