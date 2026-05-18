'use client';

import { useEffect, useRef } from 'react';
import { Bot, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGaiaConversation } from '../../hooks/useGaiaConversation';
import { useTextToSpeech } from '@/@common/hooks/useTextToSpeech';
import { useTtsSettings } from '@/@common/hooks/useTtsSettings';
import { TtsSetupSheet } from '@/@common/components/TtsSetupSheet';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { QuotaBadge } from './QuotaBadge';
import { GAIA_PLAN_LIMITS } from '../../constants';
import type { TGaiaPlan } from '../../constants';

interface GaiaChatProps {
  plan?: TGaiaPlan;
}

/** Full GaIA chat panel: message history, quota badge, input, and auto-scroll. */
export const GaiaChat = ({ plan = 'free' }: GaiaChatProps) => {
  const Conversation = useGaiaConversation(plan);
  const Tts = useTextToSpeech();
  const TtsSettings = useTtsSettings();
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [Conversation.messages]);

  // Auto-read: when a new assistant message arrives and auto-read is enabled
  useEffect(() => {
    const msgs = Conversation.messages;
    if (TtsSettings.autoRead && msgs.length > prevMsgCountRef.current) {
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant' && !last.error) {
        Tts.read(last.text, last.id);
      }
    }
    prevMsgCountRef.current = msgs.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Conversation.messages]);

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      Tts.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planLimit = GAIA_PLAN_LIMITS[plan].dailyInteractions;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-sm ring-1 ring-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3BB25E] shadow-sm">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">GaIA</p>
            <p className="text-xs text-gray-400">Asistente agrícola</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <QuotaBadge remaining={Conversation.remaining} limit={planLimit} />

          {Conversation.messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={Conversation.clearChat}
              aria-label="Limpiar chat"
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {Conversation.messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3BB25E]/10">
              <Bot className="h-6 w-6 text-[#3BB25E]" />
            </div>
            <p className="text-sm font-medium text-gray-700">¡Hola! Soy GaIA</p>
            <p className="max-w-xs text-xs text-gray-400">
              Tu asistente agrícola. Pregúntame sobre tus cultivos, parcelas o actividades del campo.
            </p>
          </div>
        )}

        {Conversation.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onRetry={Conversation.retry} tts={Tts} />
        ))}

        {Conversation.loading && (
          <div className="flex items-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3BB25E] text-xs font-bold text-white shadow-sm">
              G
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSubmit={Conversation.send} disabled={Conversation.loading} />

      {Tts.showSetup && (
        <TtsSetupSheet
          piperStatus={Tts.piperStatus}
          piperProgress={Tts.piperProgress}
          onDownload={Tts.triggerPiperDownload}
          onDismiss={Tts.dismissSetup}
        />
      )}
    </div>
  );
};
