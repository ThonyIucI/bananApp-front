import type { ETtsEngine } from '../constants';

/**
 * A synthesized audio clip that can be played once and cancelled.
 * play() resolves when playback ends naturally or when aborted via signal.
 * play() rejects only on genuine playback errors.
 */
export interface ITtsClip {
  play(signal: AbortSignal): Promise<void>;
  cancel(): void;
}

/**
 * Abstraction over a TTS synthesis engine.
 * blobCache: in-memory Map<text, Blob> for engines that produce audio blobs (Piper, Gemini).
 *            The engine reads from / writes to this cache; native engine ignores it.
 */
export interface ITtsEngine {
  readonly id: ETtsEngine;
  /** Returns true when this engine is ready to synthesize (e.g. Piper model is cached). */
  isAvailable(): Promise<boolean>;
  /**
   * Synthesizes the spoken text into a playable clip.
   * Must check blobCache before synthesizing to avoid redundant work.
   */
  synthesize(text: string, signal: AbortSignal, blobCache: Map<string, Blob>): Promise<ITtsClip>;
}
