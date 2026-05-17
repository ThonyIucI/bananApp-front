export const GAIA_PLAN_LIMITS = {
  free: {
    dailyInteractions: 30,
    contextMessages: 8,
    sttMode: 'on-device',
    tts: 'native',
    communityAlerts: 'receive',
    crud: 'limited',
  },
  pro: {
    dailyInteractions: 150,
    contextMessages: 12,
    sttMode: 'on-device',
    tts: 'enhanced',
    communityAlerts: 'receive-emit',
    crud: 'full',
  },
  promax: {
    dailyInteractions: 500,
    contextMessages: 20,
    sttMode: 'gemini-audio',
    tts: 'enhanced',
    communityAlerts: 'receive-emit',
    crud: 'full',
  },
} as const;

export type TGaiaPlan = keyof typeof GAIA_PLAN_LIMITS;
