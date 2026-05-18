'use client';

import type { TTtsSegment } from './segments';
import type { ITtsClip, ITtsEngine } from './engines/types';

interface TRunTtsQueueOptions {
  segments: TTtsSegment[];
  fromIndex: number;
  engine: ITtsEngine;
  onSegmentStart: (index: number) => void;
  onDone: () => void;
  onError: (err: Error) => void;
  signal: AbortSignal;
  blobCache: Map<string, Blob>;
}

/**
 * Plays a list of segments sequentially, pre-synthesizing the next segment
 * while the current one is playing (SEGMENT_LOOKAHEAD = 1).
 *
 * For Piper/Gemini this dramatically reduces time-to-first-audio: segment[0]
 * starts playing as soon as its synthesis finishes (~1-2s for short text),
 * while segment[1] is synthesized in parallel.
 *
 * For native TTS synthesis is instant so the lookahead has no meaningful delay.
 *
 * The blobCache is shared across calls — cached segments are replayed without re-synthesis.
 */
export const runTtsQueue = async ({
  segments,
  fromIndex,
  engine,
  onSegmentStart,
  onDone,
  onError,
  signal,
  blobCache,
}: TRunTtsQueueOptions): Promise<void> => {
  let lookaheadPromise: Promise<ITtsClip> | null = null;

  for (let i = fromIndex; i < segments.length; i++) {
    if (signal.aborted) return;

    let clip: ITtsClip;
    try {
      if (lookaheadPromise) {
        clip = await lookaheadPromise;
        lookaheadPromise = null;
      } else {
        clip = await engine.synthesize(segments[i].spoken, signal, blobCache);
      }
    } catch (err) {
      if (!signal.aborted) {
        onError(err instanceof Error ? err : new Error('TTS synthesis error'));
      }
      return;
    }

    if (signal.aborted) {
      clip.cancel();
      return;
    }

    // Start pre-synthesizing the next segment while we play the current one
    if (i + 1 < segments.length && !signal.aborted) {
      lookaheadPromise = engine.synthesize(segments[i + 1].spoken, signal, blobCache).catch(
        () => engine.synthesize(segments[i + 1].spoken, signal, blobCache), // one retry
      );
    }

    onSegmentStart(i);

    try {
      await clip.play(signal);
    } catch (err) {
      if (!signal.aborted) {
        onError(err instanceof Error ? err : new Error('TTS playback error'));
      }
      return;
    }

    if (signal.aborted) return;
  }

  if (!signal.aborted) onDone();
};
