'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { isTtsSupported, getBestVoice, speakText, stopSpeaking } from '@/@common/utils/tts';

export interface ITtsControl {
  read: (text: string, id: string) => void;
  stop: () => void;
  isReading: boolean;
  isReadingId: (id: string) => boolean;
  isSupported: boolean;
}

/**
 * Manages text-to-speech for a shared reading context.
 * Only one message can play at a time; calling read() on a new id
 * cancels the current playback automatically.
 */
export const useTextToSpeech = (): ITtsControl => {
  const [isReading, setIsReading] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const supported = isTtsSupported();

  const doSpeak = (text: string) => {
    const voice = getBestVoice('es') ?? getBestVoice('') ?? null;
    // Chrome bug: cancel() + immediate speak() fires onerror("interrupted") on the
    // new utterance. 50ms delay lets the cancel settle before speaking starts.
    setTimeout(() => {
      speakText(text, voice, {
        onEnd: () => {
          setIsReading(false);
          setCurrentId(null);
        },
        onError: (event) => {
          setIsReading(false);
          setCurrentId(null);
          toast.error(`Lectura en voz alta no disponible [${event.error}]`);
        },
      });
    }, 50);
  };

  const read = (text: string, id: string) => {
    if (!supported) return;

    if (currentId === id && isReading) {
      stopSpeaking();
      setIsReading(false);
      setCurrentId(null);
      return;
    }

    stopSpeaking();
    setIsReading(true);
    setCurrentId(id);

    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      // Voices already loaded — speak immediately
      doSpeak(text);
      return;
    }

    // Voices not loaded yet (async on Chrome/iOS) — wait up to 2s
    let resolved = false;

    const timeout = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      window.speechSynthesis.onvoiceschanged = null;
      setIsReading(false);
      setCurrentId(null);
      toast.error('Lectura en voz alta no disponible en este dispositivo');
    }, 2000);

    window.speechSynthesis.onvoiceschanged = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak(text);
    };
  };

  const stop = () => {
    stopSpeaking();
    setIsReading(false);
    setCurrentId(null);
  };

  const isReadingId = (id: string) => currentId === id && isReading;

  return { read, stop, isReading, isReadingId, isSupported: supported };
};
