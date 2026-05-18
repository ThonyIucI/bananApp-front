'use client';

import { useEffect, useState } from 'react';
import { Download, Trash2, CheckCircle, Loader2, Monitor, Wifi, Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTtsSettings } from '@/@common/hooks/useTtsSettings';
import { isTtsSupported, getBestFemaleVoice } from '@/@common/utils/tts';
import { isPiperCached, downloadPiper, uninstallPiper, PIPER_VOICE_SIZE_MB } from '@/lib/piper';
import { ETtsEngine, ttsEngineLabels } from '@/@common/tts/constants';
import { toast } from 'react-toastify';

type TPiperInstallState = 'checking' | 'not_installed' | 'downloading' | 'installed' | 'error';

/**
 * Settings section for GaIA audio/voice configuration.
 * Shows engine status, Piper install/uninstall, auto-read toggle, and Gemini premium option.
 */
export const GaiaAudioSettings = () => {
  const TtsSettings = useTtsSettings();
  const [nativeOk, setNativeOk] = useState(false);
  const [piperState, setPiperState] = useState<TPiperInstallState>('checking');
  const [piperProgress, setPiperProgress] = useState(0);

  useEffect(() => {
    // Check native voice availability
    const checkNative = () => {
      if (!isTtsSupported()) {
        setNativeOk(false);
        return;
      }
      const voices = window.speechSynthesis.getVoices();
      setNativeOk(voices.length > 0 && !!getBestFemaleVoice('es'));
    };

    checkNative();
    window.speechSynthesis?.addEventListener('voiceschanged', checkNative);

    // Check Piper cache
    isPiperCached().then((cached) => {
      setPiperState(cached ? 'installed' : 'not_installed');
    }).catch(() => setPiperState('not_installed'));

    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', checkNative);
    };
  }, []);

  const handleDownloadPiper = () => {
    setPiperState('downloading');
    setPiperProgress(0);
    downloadPiper((pct) => setPiperProgress(pct))
      .then(() => {
        setPiperState('installed');
        toast.success('Voz offline instalada correctamente');
      })
      .catch(() => {
        setPiperState('error');
        toast.error('Error al descargar la voz. Revisa tu conexión.', { toastId: 'piper-dl' });
      });
  };

  const handleUninstallPiper = () => {
    uninstallPiper()
      .then(() => {
        setPiperState('not_installed');
        // Reset engine preference to native if user was on Piper
        if (TtsSettings.engine === ETtsEngine.PIPER) {
          TtsSettings.update({ engine: ETtsEngine.NATIVE });
        }
        toast.success('Voz offline desinstalada');
      })
      .catch(() => {
        toast.error('No se pudo desinstalar la voz', { toastId: 'piper-uninstall' });
      });
  };

  return (
    <div className="space-y-6">
      {/* ── Engine status ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Estado de motores</p>

        {/* Native voice */}
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <Monitor className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{ttsEngineLabels[ETtsEngine.NATIVE]}</p>
              <p className="text-xs text-gray-500">
                {nativeOk ? 'Voz en español disponible' : 'Sin voz en español — se recomienda instalar la voz offline'}
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-medium ${nativeOk ? 'text-[#3BB25E]' : 'text-amber-500'}`}
          >
            {nativeOk ? '✓ OK' : '⚠ Sin voz ES'}
          </span>
        </div>

        {/* Offline Piper voice */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3BB25E]/10">
                {piperState === 'installed'
                  ? <CheckCircle className="h-4 w-4 text-[#3BB25E]" />
                  : <Download className="h-4 w-4 text-[#3BB25E]" />
                }
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{ttsEngineLabels[ETtsEngine.PIPER]}</p>
                <p className="text-xs text-gray-500">
                  {piperState === 'installed'
                    ? 'Instalada · funciona sin internet'
                    : `Descarga única · ~${PIPER_VOICE_SIZE_MB} MB · sin internet`
                  }
                </p>
              </div>
            </div>
            {piperState === 'installed' && (
              <span className="text-xs font-medium text-[#3BB25E]">✓ Instalada</span>
            )}
            {piperState === 'not_installed' && (
              <span className="text-xs text-gray-400">No instalada</span>
            )}
            {piperState === 'error' && (
              <span className="text-xs text-red-500">Error</span>
            )}
          </div>

          {/* Download progress */}
          {piperState === 'downloading' && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Descargando voz…
                </span>
                <span className="text-xs font-medium text-[#3BB25E]">{piperProgress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-1.5 rounded-full bg-[#3BB25E] transition-all duration-300"
                  style={{ width: `${piperProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {(piperState === 'not_installed' || piperState === 'error') && (
            <button
              type="button"
              onClick={handleDownloadPiper}
              className="mt-3 w-full rounded-lg bg-[#3BB25E] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#2ea050] active:scale-[0.98]"
            >
              Descargar voz offline (~{PIPER_VOICE_SIZE_MB} MB)
            </button>
          )}

          {piperState === 'installed' && (
            <button
              type="button"
              onClick={handleUninstallPiper}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 active:scale-[0.98]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Desinstalar voz offline
            </button>
          )}
        </div>

        {/* Gemini premium — locked unless plan supports it */}
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 opacity-60">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50">
              <Wifi className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{ttsEngineLabels[ETtsEngine.GEMINI]}</p>
              <p className="text-xs text-gray-500">Voz femenina natural · requiere internet · plan Pro</p>
            </div>
          </div>
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* ── Auto-read toggle ── */}
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-gray-800">Leer respuestas automáticamente</p>
          <p className="text-xs text-gray-500">
            GaIA leerá cada respuesta nueva en voz alta. El texto siempre se muestra.
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
