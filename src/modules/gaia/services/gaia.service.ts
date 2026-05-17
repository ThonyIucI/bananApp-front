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
  usage: IGaiaUsageInfo;
}

/** Sends a text message to GaIA and returns the AI response with usage info. */
export const sendGaiaMessageRequest = (payload: SendGaiaMessagePayload) =>
  apiClient.post<IGaiaMessageResponse>('/gaia/messages', payload);
