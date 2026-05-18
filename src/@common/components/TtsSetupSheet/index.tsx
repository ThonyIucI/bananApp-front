'use client';

import { X, Download, Smartphone, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
 * Offers two paths: configure device TTS or download Kokoro offline voice.
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
        role="presentation"
        className="fixed inset-0 z-40 bg-black/40 animate-fade-in motion-reduce:animate-none"
        onClick={onDismiss}
      />

      {/* Position container: bottom on mobile → center on desktop */}
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        {/* Sheet: bottom-sheet on mobile, centered modal on desktop */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Configurar lectura en voz alta"
          className="w-full animate-sheet-in rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:max-w-sm sm:rounded-2xl"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 pt-1">
            <p className="text-sm font-semibold text-gray-900">Lectura en voz alta</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onDismiss}
              aria-label="Cerrar"
              className="transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="px-4 pb-3 text-xs text-gray-500">
            Tu dispositivo no tiene voz en español configurada. Elige una opción:
          </p>

          <div className="space-y-2 px-4 pb-safe-bottom pb-6">
            {/* Option 1 — Configure device */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Smartphone className="h-4 w-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">Voz del dispositivo</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{instructions}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400">o</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Option 2 — Download Kokoro */}
            <div className="rounded-xl border border-gray-100 bg-gray-100 p-4">
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
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#3BB25E]">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Lista — el siguiente mensaje se leerá automáticamente
                    </p>
                  ) : isDownloading ? (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Descargando voz…
                        </span>
                        <span className="tabular-nums text-xs font-medium text-[#3BB25E]">
                          {piperProgress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-1.5 rounded-full bg-[#3BB25E] transition-[width] duration-300 ease-out motion-reduce:transition-none"
                          style={{ width: `${piperProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="default"
                      onClick={onDownload}
                      className="mt-3 w-full active:scale-[0.98] motion-reduce:active:scale-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Descargar voz (~{PIPER_VOICE_SIZE_MB} MB)
                    </Button>
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
        </div>{/* sheet */}
      </div>{/* position container */}
    </>
  );
};
