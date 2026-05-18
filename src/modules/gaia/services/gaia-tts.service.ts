import { apiClient } from '@/lib/api/client';

export interface IGaiaTtsResponse {
  /** Base64-encoded audio data. */
  data: string;
  /** MIME type of the audio, e.g. `audio/pcm;rate=24000` or `audio/wav`. */
  mimeType: string;
}

/** Sends a text segment to the backend Gemini TTS endpoint. Requires Pro plan. */
export const gaiaTtsRequest = (text: string) =>
  apiClient.post<IGaiaTtsResponse>('/gaia/tts', { text });
