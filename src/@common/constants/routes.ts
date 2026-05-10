export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/registro',
  GOOGLE_SUCCESS: '/auth/google/success',
} as const;

export const APP_ROUTES = {
  DASHBOARD: '/dashboard',
  INDEPENDENT_DASHBOARD: '/parcelas',
  BUNDLING_NEW: '/enfundado/nuevo',
  BUNDLING_HISTORY: '/enfundado/historial',
  RIBBON_CALENDAR: '/calendario',
} as const;

export const COOPERATIVE_ROUTES = {
  LIST: '/admin/cooperativas',
  DETAIL: (id: string) => `/admin/cooperativas/${id}`,
} as const;

export const USER_ROUTES = {
  LIST: '/admin/usuarios',
} as const;

export const SECTOR_ROUTES = {
  LIST: '/admin/sectores',
} as const;

export const PLOT_ROUTES = {
  LIST: '/admin/parcelas',
} as const;

export const BUNDLING_ROUTES = {
  LIST: '/enfundado',
} as const;
