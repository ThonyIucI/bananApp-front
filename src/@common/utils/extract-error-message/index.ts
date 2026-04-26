import type { AxiosError } from 'axios';

export function extractErrorMessage(error: AxiosError): string {
  const data = error.response?.data as Record<string, unknown> | undefined;

  if (data?.error && typeof data.error === 'string') return data.error;
  if (data?.message) {
    if (Array.isArray(data.message)) return (data.message as string[]).join('. ');
    if (typeof data.message === 'string') return data.message;
  }

  switch (error.response?.status) {
    case 401:
      return 'Sesión expirada. Vuelve a ingresar.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 429:
      return 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.';
    case 500:
      return 'Error interno del servidor. Intenta de nuevo más tarde.';
    default:
      if (!error.response) return 'Error de conexión. Verifica tu internet e intenta de nuevo.';
      return 'Error inesperado. Intenta de nuevo.';
  }
}
