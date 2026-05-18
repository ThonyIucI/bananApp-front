'use client';

import { Bot } from 'lucide-react';
import { SettingsView } from '@/modules/settings/components/SettingsView';
import { GaiaAudioSettings } from '@/modules/settings/components/GaiaAudioSettings';

/** App settings page — organized in sections. Add new sections here as the app grows. */
const ConfiguracionPage = () => (
  <div className="h-full overflow-y-auto">
    <div className="mb-6">
      <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
      <p className="text-sm text-gray-400">Personaliza el comportamiento de la aplicación</p>
    </div>

    <SettingsView
      sections={[
        {
          id: 'gaia-audio',
          title: 'GaIA — Audio y voz',
          description: 'Configura cómo GaIA lee las respuestas en voz alta',
          icon: <Bot className="h-5 w-5 text-[#3BB25E]" />,
          children: <GaiaAudioSettings />,
        },
      ]}
    />
  </div>
);

export default ConfiguracionPage;
