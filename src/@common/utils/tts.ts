/** Returns true if the Web Speech TTS API is available in this browser. */
export const isTtsSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Returns voices available on this device, optionally filtered by language prefix (e.g. 'es'). */
export const getAvailableVoices = (lang?: string): SpeechSynthesisVoice[] => {
  if (!isTtsSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  return lang ? voices.filter((v) => v.lang.startsWith(lang)) : voices;
};

/**
 * Picks the best voice for the given language.
 * Prefers high-quality voices (Enhanced/Premium) when available.
 * Pass an empty string to match any available voice.
 */
export const getBestVoice = (lang: string): SpeechSynthesisVoice | null => {
  const voices = lang ? getAvailableVoices(lang) : getAvailableVoices();
  if (voices.length === 0) return null;
  return voices.find((v) => /enhanced|premium/i.test(v.name)) ?? voices[0];
};

export interface TSpeakOptions {
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

/**
 * Speaks the given text using the provided voice.
 * Does NOT cancel previous speech — caller must stop first.
 * Not setting voice/lang when none is provided lets the browser pick its
 * default, avoiding "language-unavailable" errors on devices without
 * Spanish voices.
 */
export const speakText = (
  text: string,
  voice?: SpeechSynthesisVoice | null,
  options: TSpeakOptions = {},
): void => {
  if (!isTtsSupported()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = (ev) => options.onError!(ev);
  window.speechSynthesis.speak(utterance);
};

/** Stops any ongoing speech synthesis immediately. */
export const stopSpeaking = (): void => {
  if (isTtsSupported()) window.speechSynthesis.cancel();
};

/** Returns true if speech synthesis is currently playing. */
export const isSpeaking = (): boolean =>
  isTtsSupported() && window.speechSynthesis.speaking;
