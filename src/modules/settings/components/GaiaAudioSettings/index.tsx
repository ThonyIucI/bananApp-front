'use client';

import { useEffect, useState } from 'react';
import { Download, Trash2, CheckCircle, Loader2, Monitor, Wifi, Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTtsSettings } from '@/@common/hooks/useTtsSettings';
import { isTtsSupported, getBestFemaleVoice } from '@/@common/utils/tts';
import { isPiperCached, downloadPiper, uninstallPiper, PIPER_VOICE_SIZE_MB } from '@/lib/piper';
import { ETtsEngine, ttsEngineLabels } from '@/@common/tts/constants';
import { useAuthContext } from '@/modules/auth/context/auth.context';
import { EGaiaPlan } from '@/modules/users/services/user.service';
import { toast } from 'react-toastify';

type TPiperInstallState = 'checking' | 'not_installed' | 'downloading' | 'installed' | 'error';

const GEMINI_ALLOWED_PLANS: string[] = [EGaiaPlan.PRO, EGaiaPlan.PROMAX];

const CARD_BASE =
  'w-full rounded-xl border text-left transition-[border-color,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none';

const CARD_INACTIVE =
  'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white hover:shadow-sm';

const CARD_ACTIVE_GREEN =
  'border-[#3BB25E]/40 bg-[#3BB25E]/[0.04] shadow-sm';

const CARD_ACTIVE_PURPLE =
  'border-purple-200 bg-purple-50/60 shadow-sm';

/**
 * Settings section for GaIA audio/voice configuration.
 * Three mutually exclusive engine cards (Native · Piper · Gemini).
 * Gemini unlocked only for Pro / ProMax. When active, an explicit
 * "Desactivar Gemini" button appears to revert to the default engine.
 */
export const GaiaAudioSettings = () => {
  const TtsSettings = useTtsSettings();
  const { user } = useAuthContext();
  const [nativeOk, setNativeOk] = useState(false);
  const [piperState, setPiperState] = useState<TPiperInstallState>('checking');
  const [piperProgress, setPiperProgress] = useState(0);

  const geminiUnlocked = GEMINI_ALLOWED_PLANS.includes(user?.subscriptionTier ?? '');
  const active = TtsSettings.engine;

  useEffect(() => {
    const checkNative = () => {
      if (!isTtsSupported()) { setNativeOk(false); return; }
      const voices = window.speechSynthesis.getVoices();
      setNativeOk(voices.length > 0 && !!getBestFemaleVoice('es'));
    };
    checkNative();
    window.speechSynthesis?.addEventListener('voiceschanged', checkNative);
    isPiperCached()
      .then((cached) => setPiperState(cached ? 'installed' : 'not_installed'))
      .catch(() => setPiperState('not_installed'));
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', checkNative);
  }, []);

  const selectEngine = (engine: ETtsEngine) => TtsSettings.update({ engine });

  const deactivateGemini = () => TtsSettings.update({ engine: ETtsEngine.NATIVE });

  const handleDownloadPiper = () => {
    setPiperState('downloading');
    setPiperProgress(0);
    downloadPiper((pct) => setPiperProgress(pct))
      .then(() => { setPiperState('installed'); toast.success('Voz offline instalada correctamente'); })
      .catch(() => { setPiperState('error'); toast.error('Error al descargar. Revisa tu conexión.', { toastId: 'piper-dl' }); });
  };

  const handleUninstallPiper = () => {
    uninstallPiper()
      .then(() => {
        setPiperState('not_installed');
        if (active === ETtsEngine.PIPER) TtsSettings.update({ engine: ETtsEngine.NATIVE });
        toast.success('Voz offline desinstalada');
      })
      .catch(() => toast.error('No se pudo desinstalar la voz', { toastId: 'piper-uninstall' }));
  };

  const isNativeActive = active === ETtsEngine.NATIVE;
  const isPiperActive = active === ETtsEngine.PIPER;
  const isGeminiActive = active === ETtsEngine.GEMINI;

  return (
    <div className="space-y-6">
      {/* ── Engine selector ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Motor de voz</p>

        {/* ── Native ── disabled when device has no Spanish voice */}
        <button
          type="button"
          disabled={!nativeOk}
          onClick={() => nativeOk && selectEngine(ETtsEngine.NATIVE)}
          aria-pressed={isNativeActive}
          className={`${CARD_BASE} ${isNativeActive ? CARD_ACTIVE_GREEN : CARD_INACTIVE} flex items-center gap-3 p-4
            ${nativeOk ? 'cursor-pointer active:scale-[0.98]' : 'cursor-not-allowed opacity-50 active:scale-100'}`}
        >
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${isNativeActive ? 'bg-[#3BB25E]/15' : 'bg-blue-50'}`}>
            <Monitor className={`h-4 w-4 transition-colors duration-150 ${isNativeActive ? 'text-[#3BB25E]' : 'text-blue-400'}`} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-800">{ttsEngineLabels[ETtsEngine.NATIVE]}</p>
            <p className="text-xs text-gray-500">
              {nativeOk ? 'Voz en español disponible' : 'Sin voz ES en este dispositivo'}
            </p>
          </div>
          {/* Radio dot — only meaningful when available */}
          {nativeOk ? (
            <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition-[border-color,background-color] duration-150 ${isNativeActive ? 'border-[#3BB25E] bg-[#3BB25E]' : 'border-gray-300 bg-white'}`} />
          ) : (
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
              No disponible
            </span>
          )}
        </button>

        {/* ── Piper offline ── */}
        <div className={`${CARD_BASE} ${isPiperActive && piperState === 'installed' ? CARD_ACTIVE_GREEN : CARD_INACTIVE}`}>
          <button
            type="button"
            disabled={piperState !== 'installed'}
            onClick={() => piperState === 'installed' && selectEngine(ETtsEngine.PIPER)}
            aria-pressed={isPiperActive}
            className="flex w-full cursor-pointer items-center gap-3 p-4 text-left active:scale-[0.98] disabled:cursor-default disabled:active:scale-100"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${isPiperActive ? 'bg-[#3BB25E]/15' : 'bg-[#3BB25E]/10'}`}>
              {piperState === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-[#3BB25E]" />}
              {(piperState === 'not_installed' || piperState === 'error' || piperState === 'downloading') && (
                <Download className="h-4 w-4 text-[#3BB25E]" />
              )}
              {piperState === 'installed' && (
                <CheckCircle className={`h-4 w-4 transition-colors duration-150 ${isPiperActive ? 'text-[#3BB25E]' : 'text-[#3BB25E]/70'}`} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{ttsEngineLabels[ETtsEngine.PIPER]}</p>
              <p className="text-xs text-gray-500">
                {piperState === 'installed'
                  ? 'Instalada · funciona sin internet'
                  : `Descarga única · ~${PIPER_VOICE_SIZE_MB} MB · sin internet`}
              </p>
            </div>
            {piperState === 'installed' ? (
              <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition-[border-color,background-color] duration-150 ${isPiperActive ? 'border-[#3BB25E] bg-[#3BB25E]' : 'border-gray-300 bg-white'}`} />
            ) : (
              <span className={`shrink-0 text-xs ${piperState === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
                {piperState === 'error' ? 'Error' : 'No instalada'}
              </span>
            )}
          </button>

          {/* Download progress bar */}
          {piperState === 'downloading' && (
            <div className="px-4 pb-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Descargando voz…
                </span>
                <span className="text-xs font-medium tabular-nums text-[#3BB25E]">{piperProgress}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-1 rounded-full bg-[#3BB25E] transition-[width] duration-300 ease-out"
                  style={{ width: `${piperProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Install action */}
          {(piperState === 'not_installed' || piperState === 'error') && (
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={handleDownloadPiper}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#3BB25E] px-4 py-2 text-sm font-medium text-white
                  transition-[background-color,transform] duration-150 ease-out hover:bg-[#2ea050] active:scale-[0.98] motion-reduce:transition-none"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar voz offline · ~{PIPER_VOICE_SIZE_MB} MB
              </button>
            </div>
          )}

          {/* Uninstall action */}
          {piperState === 'installed' && (
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={handleUninstallPiper}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-white px-4 py-2 text-sm font-medium text-red-500
                  transition-[background-color,border-color,transform] duration-150 ease-out hover:border-red-200 hover:bg-red-50 active:scale-[0.98] motion-reduce:transition-none"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Desinstalar voz offline
              </button>
            </div>
          )}
        </div>

        {/* ── Gemini premium ── */}
        {geminiUnlocked ? (
          <div className={`${CARD_BASE} ${isGeminiActive ? CARD_ACTIVE_PURPLE : CARD_INACTIVE}`}>
            <button
              type="button"
              onClick={() => selectEngine(ETtsEngine.GEMINI)}
              aria-pressed={isGeminiActive}
              className="flex w-full cursor-pointer items-center gap-3 p-4 text-left active:scale-[0.98]"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${isGeminiActive ? 'bg-purple-100' : 'bg-purple-50'}`}>
                <Wifi className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{ttsEngineLabels[ETtsEngine.GEMINI]}</p>
                <p className="text-xs text-gray-500">Voz femenina natural · requiere internet</p>
              </div>
              <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition-[border-color,background-color] duration-150 ${isGeminiActive ? 'border-purple-500 bg-purple-500' : 'border-gray-300 bg-white'}`} />
            </button>

            {/* Deactivate Gemini — only when active */}
            {isGeminiActive && (
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={deactivateGemini}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600
                    transition-[background-color,border-color,transform] duration-150 ease-out hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] motion-reduce:transition-none"
                >
                  Desactivar Gemini
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Locked — FREE plan */
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 opacity-50 cursor-not-allowed select-none">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50">
              <Wifi className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{ttsEngineLabels[ETtsEngine.GEMINI]}</p>
              <p className="text-xs text-gray-400">Voz femenina natural · requiere internet</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Pro</span>
              <Lock className="h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* ── Auto-read toggle ── */}
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-gray-800">Leer respuestas automáticamente</p>
          <p className="text-xs text-gray-500">
            GaIA leerá cada respuesta nueva en voz alta.
          </p>
        </div>
        <Switch
          checked={TtsSettings.autoRead}
          onCheckedChange={(checked) => TtsSettings.update({ autoRead: checked })}
          aria-label="Activar lectura automática"
        />
      </div>
    </div>
  );
};
