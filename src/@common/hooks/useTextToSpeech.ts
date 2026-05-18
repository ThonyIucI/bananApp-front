'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { isTtsSupported, getBestVoice, speakText, stopSpeaking } from '@/@common/utils/tts';
import {
  isPiperCached,
  downloadPiper,
  speakWithPiper,
} from '@/lib/piper';

export type TPiperStatus = 'idle' | 'downloading' | 'ready' | 'error';

export interface ITtsControl {
  read: (text: string, id: string) => void;
  stop: () => void;
  isReading: boolean;
  isReadingId: (id: string) => boolean;
  isSupported: boolean;
  showSetup: boolean;
  dismissSetup: () => void;
  piperStatus: TPiperStatus;
  piperProgress: number;
  triggerPiperDownload: () => void;
}

// Native TTS errors that mean the device has no working speech engine
const CONFIG_ERRORS = new Set(['synthesis-failed', 'voice-unavailable', 'language-unavailable']);

/**
 * Manages text-to-speech with two-tier fallback:
 * 1. Native Web Speech API (instant, no download)
 * 2. Piper WASM (offline, downloaded once to OPFS ~63 MB)
 *
 * When native TTS fails and Piper is not cached, `showSetup` becomes true
 * so the UI can offer the user a download option.
 */
export const useTextToSpeech = (): ITtsControl => {
  const [isReading, setIsReading] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [piperStatus, setPiperStatus] = useState<TPiperStatus>('idle');
  const [piperProgress, setPiperProgress] = useState(0);

  const supported = isTtsSupported();
  const piperPlaybackRef = useRef<{ stop: () => void } | null>(null);
  // Text to auto-speak once Piper finishes downloading
  const pendingRef = useRef<{ text: string; id: string } | null>(null);
  // Abort flag: set to true when stop() is called during async Piper synthesis
  const abortedRef = useRef(false);

  const doSpeakWithPiper = async (text: string, id: string) => {
    abortedRef.current = false;
    setIsReading(true);
    setCurrentId(id);
    try {
      const playback = await speakWithPiper(text, {
        onEnd: () => {
          setIsReading(false);
          setCurrentId(null);
          piperPlaybackRef.current = null;
        },
        onError: () => {
          setIsReading(false);
          setCurrentId(null);
          piperPlaybackRef.current = null;
          toast.error('No se pudo reproducir con la voz integrada');
        },
      });
      if (abortedRef.current) {
        playback.stop();
        return;
      }
      piperPlaybackRef.current = playback;
    } catch {
      if (!abortedRef.current) {
        setIsReading(false);
        setCurrentId(null);
        toast.error('Error al sintetizar con la voz integrada');
      }
    }
  };

  const tryPiper = async (text: string, id: string) => {
    const cached = await isPiperCached();
    if (cached) {
      setPiperStatus('ready');
      await doSpeakWithPiper(text, id);
    } else {
      pendingRef.current = { text, id };
      setShowSetup(true);
    }
  };

  const doNativeSpeak = (text: string, id: string) => {
    const voice = getBestVoice('es') ?? getBestVoice('') ?? null;
    setTimeout(() => {
      speakText(text, voice, {
        onEnd: () => {
          setIsReading(false);
          setCurrentId(null);
        },
        onError: (event) => {
          if (CONFIG_ERRORS.has(event.error)) {
            // Native engine broken → try Piper
            void tryPiper(text, id);
          } else {
            setIsReading(false);
            setCurrentId(null);
            toast.error(`No se pudo reproducir el audio [${event.error}]`);
          }
        },
      });
    }, 50);
  };

  const read = (text: string, id: string) => {
    if (!supported) {
      void tryPiper(text, id);
      return;
    }

    // Toggle off if same message is playing
    if (currentId === id && isReading) {
      stop();
      return;
    }

    stopSpeaking();
    piperPlaybackRef.current?.stop();
    piperPlaybackRef.current = null;
    setIsReading(true);
    setCurrentId(id);

    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      doNativeSpeak(text, id);
      return;
    }

    // Voices not loaded yet — wait up to 2s then fall back to Piper
    let resolved = false;

    const onVoicesChanged = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      doNativeSpeak(text, id);
    };

    const timeout = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      void tryPiper(text, id);
    }, 2000);

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
  };

  const stop = () => {
    abortedRef.current = true;
    stopSpeaking();
    piperPlaybackRef.current?.stop();
    piperPlaybackRef.current = null;
    setIsReading(false);
    setCurrentId(null);
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
        // Auto-speak the message that triggered the setup sheet
        if (pendingRef.current) {
          const { text, id } = pendingRef.current;
          pendingRef.current = null;
          await doSpeakWithPiper(text, id);
        }
      })
      .catch(() => {
        setPiperStatus('error');
        toast.error('Error al descargar la voz. Revisa tu conexión e intenta de nuevo.');
      });
  };

  const dismissSetup = () => {
    setShowSetup(false);
    pendingRef.current = null;
    if (!isReading) {
      setIsReading(false);
      setCurrentId(null);
    }
  };

  const isReadingId = (id: string) => currentId === id && isReading;

  return {
    read,
    stop,
    isReading,
    isReadingId,
    isSupported: supported,
    showSetup,
    dismissSetup,
    piperStatus,
    piperProgress,
    triggerPiperDownload,
  };
};
