'use client';

import { X, Download, Smartphone, CheckCircle, Loader2 } from 'lucide-react';
import type { TPiperStatus } from '@/@common/hooks/useTextToSpeech';
import { PIPER_VOICE_SIZE_MB } from '@/lib/piper';

interface TtsSetupSheetProps {
  piperStatus: TPiperStatus;
  piperProgress: number;
  onDownload: () => void;
  onDismiss: () => void;
}

const DEVICE_INSTRUCTIONS: Record<string, string> = {
  android: 'Ajustes → Accesibilidad → Texto a voz → Instalar datos de voz en español',
  ios: 'Ajustes → Accesibilidad → Contenido hablado → Voces → Español',
  other: 'Ajustes → Accesibilidad → Texto a voz → Idiomas → Español',
};

const getDeviceType = (): 'android' | 'ios' | 'other' => {
  if (typeof navigator === 'undefined') return 'other';
  if (/android/i.test(navigator.userAgent)) return 'android';
  if (/ipad|iphone|ipod/i.test(navigator.userAgent)) return 'ios';
  return 'other';
};

/**
 * Bottom sheet shown when native TTS is unavailable.
 * Offers two paths: configure device TTS or download Piper offline voice.
 */
export const TtsSetupSheet = ({
  piperStatus,
  piperProgress,
  onDownload,
  onDismiss,
}: TtsSetupSheetProps) => {
  const device = getDeviceType();
  const instructions = DEVICE_INSTRUCTIONS[device];
  const isDownloading = piperStatus === 'downloading';
  const isReady = piperStatus === 'ready';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 animate-fade-in"
        onClick={onDismiss}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-panel-in rounded-t-2xl bg-white shadow-xl ring-1 ring-gray-100">
        {/* Handle + header */}
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200 absolute left-1/2 top-3 -translate-x-1/2" />
          <p className="text-sm font-semibold text-gray-900">Lectura en voz alta</p>
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="px-4 pb-3 text-xs text-gray-500">
          Tu dispositivo no tiene voz en español configurada. Elige una opción:
        </p>

        <div className="space-y-2 px-4 pb-6">
          {/* Option 1: Configure device */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <Smartphone className="h-4 w-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">Voz del dispositivo</p>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{instructions}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">o</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Option 2: Download Piper */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3BB25E]/10">
                {isReady
                  ? <CheckCircle className="h-4 w-4 text-[#3BB25E]" />
                  : <Download className="h-4 w-4 text-[#3BB25E]" />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800">Voz integrada (offline)</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Sin configuración · Funciona sin internet · Descarga única
                </p>

                {isReady ? (
                  <p className="mt-2 text-xs font-medium text-[#3BB25E]">
                    ✓ Lista — el siguiente mensaje se leerá automáticamente
                  </p>
                ) : isDownloading ? (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5">
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
                ) : (
                  <button
                    type="button"
                    onClick={onDownload}
                    className="mt-3 w-full rounded-lg bg-[#3BB25E] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#2ea050] active:scale-[0.98] disabled:opacity-50"
                  >
                    Descargar voz (~{PIPER_VOICE_SIZE_MB} MB)
                  </button>
                )}

                {piperStatus === 'error' && (
                  <p className="mt-2 text-xs text-red-500">
                    Error al descargar. Revisa tu conexión e intenta de nuevo.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
