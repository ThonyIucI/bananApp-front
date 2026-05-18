'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { isTtsSupported } from '@/@common/utils/tts';
import { downloadPiper } from '@/lib/piper';
import { nativeEngine } from '@/@common/tts/engines/nativeEngine';
import { piperEngine } from '@/@common/tts/engines/piperEngine';
import { geminiEngine } from '@/@common/tts/engines/geminiEngine';
import { splitIntoSegments } from '@/@common/tts/segments';
import { runTtsQueue } from '@/@common/tts/player';
import { getTtsSettings } from '@/@common/tts/settings';
import { ETtsEngine } from '@/@common/tts/constants';
import type { ITtsEngine } from '@/@common/tts/engines/types';

export type TPiperStatus = 'idle' | 'downloading' | 'ready' | 'error';

export interface ITtsControl {
  /** Start reading a message from the beginning. Toggles off if the same message is playing. */
  read: (text: string, id: string) => void;
  /** Start reading a message from a specific segment index. */
  readFromSegment: (text: string, id: string, segmentIndex: number) => void;
  stop: () => void;
  isReading: boolean;
  isReadingId: (id: string) => boolean;
  /** Index of the segment currently being spoken, or null when not reading. */
  activeSegmentIndex: number | null;
  isSupported: boolean;
  showSetup: boolean;
  dismissSetup: () => void;
  piperStatus: TPiperStatus;
  piperProgress: number;
  triggerPiperDownload: () => void;
}

/**
 * Orchestrates text-to-speech with two-tier engine chain:
 * 1. Native Web Speech API (instant, depends on device voices)
 * 2. Piper WASM (offline female voice, downloaded once to OPFS ~63 MB)
 *
 * Text is split into short segments before synthesis — first audio plays in ~1-2 s
 * while the rest is synthesized in parallel. Synthesized blobs are cached in memory
 * so re-reading the same message is instantaneous for Piper.
 */
export const useTextToSpeech = (): ITtsControl => {
  const [isReading, setIsReading] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [piperStatus, setPiperStatus] = useState<TPiperStatus>('idle');
  const [piperProgress, setPiperProgress] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  // Per-session blob cache: keyed by segment spoken text, avoids re-running Piper WASM
  const blobCacheRef = useRef<Map<string, Blob>>(new Map());
  const pendingRef = useRef<{ text: string; id: string; fromIndex: number } | null>(null);

  // Stop and abort any in-progress reading
  const stopCurrent = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsReading(false);
    setCurrentId(null);
    setActiveSegmentIndex(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  /** Resolves the best available engine based on user preference and availability. */
  const resolveEngine = async (): Promise<ITtsEngine | null> => {
    const { engine: preferred } = getTtsSettings();

    if (preferred === ETtsEngine.GEMINI) return geminiEngine;

    if (preferred === ETtsEngine.PIPER) {
      if (await piperEngine.isAvailable()) return piperEngine;
      return null; // needs download
    }

    // Default chain: native → Piper
    if (isTtsSupported()) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) return nativeEngine;

      // Voices not loaded yet — wait up to 1.5 s
      const voiceReady = await new Promise<boolean>((resolve) => {
        let done = false;
        const onChanged = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
          resolve(window.speechSynthesis.getVoices().length > 0);
        };
        const timer = setTimeout(() => {
          if (done) return;
          done = true;
          window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
          resolve(false);
        }, 1500);
        window.speechSynthesis.addEventListener('voiceschanged', onChanged);
      });
      if (voiceReady) return nativeEngine;
    }

    if (await piperEngine.isAvailable()) return piperEngine;

    return null;
  };

  const doRead = async (text: string, id: string, fromIndex: number) => {
    stopCurrent();

    const controller = new AbortController();
    abortRef.current = controller;
    setIsReading(true);
    setCurrentId(id);
    setActiveSegmentIndex(fromIndex);

    const engine = await resolveEngine();

    if (!engine) {
      pendingRef.current = { text, id, fromIndex };
      setShowSetup(true);
      setIsReading(false);
      setCurrentId(null);
      setActiveSegmentIndex(null);
      return;
    }

    if (controller.signal.aborted) return;

    const segments = splitIntoSegments(text);
    if (segments.length === 0) {
      setIsReading(false);
      setCurrentId(null);
      setActiveSegmentIndex(null);
      return;
    }

    await runTtsQueue({
      segments,
      fromIndex: Math.min(fromIndex, segments.length - 1),
      engine,
      onSegmentStart: (i) => setActiveSegmentIndex(i),
      onDone: () => {
        setIsReading(false);
        setCurrentId(null);
        setActiveSegmentIndex(null);
      },
      onError: () => {
        if (!controller.signal.aborted) {
          toast.error('Error al reproducir el audio', { toastId: 'tts-error' });
          setIsReading(false);
          setCurrentId(null);
          setActiveSegmentIndex(null);
        }
      },
      signal: controller.signal,
      blobCache: blobCacheRef.current,
    });
  };

  const read = (text: string, id: string) => {
    if (currentId === id && isReading) {
      stopCurrent();
      return;
    }
    void doRead(text, id, 0);
  };

  const readFromSegment = (text: string, id: string, segmentIndex: number) => {
    void doRead(text, id, segmentIndex);
  };

  const stop = () => {
    stopCurrent();
  };

  const triggerPiperDownload = () => {
    if (piperStatus === 'downloading') return;
    setPiperStatus('downloading');
    setPiperProgress(0);

    downloadPiper((pct) => setPiperProgress(pct))
      .then(async () => {
        setPiperStatus('ready');
        setPiperProgress(100);
        setShowSetup(false);
        if (pendingRef.current) {
          const { text, id, fromIndex } = pendingRef.current;
          pendingRef.current = null;
          await doRead(text, id, fromIndex);
        }
      })
      .catch(() => {
        setPiperStatus('error');
        toast.error('Error al descargar la voz. Revisa tu conexión e intenta de nuevo.', {
          toastId: 'piper-download-error',
        });
      });
  };

  const dismissSetup = () => {
    setShowSetup(false);
    pendingRef.current = null;
  };

  const isReadingId = (id: string) => currentId === id && isReading;

  return {
    read,
    readFromSegment,
    stop,
    isReading,
    isReadingId,
    activeSegmentIndex,
    isSupported: typeof window !== 'undefined',
    showSetup,
    dismissSetup,
    piperStatus,
    piperProgress,
    triggerPiperDownload,
  };
};
