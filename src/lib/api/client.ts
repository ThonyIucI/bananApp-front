import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const ACCESS_TOKEN_KEY = 'banan_at';

// Normalize server errors to a human-readable message (always in Spanish)
function extractErrorMessage(error: AxiosError): string {
  const data = error.response?.data as Record<string, unknown> | undefined;

  if (data?.error && typeof data.error === 'string') return data.error;
  if (data?.message) {
    if (Array.isArray(data.message)) return (data.message as string[]).join('. ');
    if (typeof data.message === 'string') return data.message;
  }

  switch (error.response?.status) {
    case 401: return 'Sesión expirada. Vuelve a ingresar.';
    case 403: return 'No tienes permisos para realizar esta acción.';
    case 404: return 'El recurso solicitado no fue encontrado.';
    case 429: return 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.';
    case 500: return 'Error interno del servidor. Intenta de nuevo más tarde.';
    default:
      if (!error.response) return 'Error de conexión. Verifica tu internet e intenta de nuevo.';
      return 'Error inesperado. Intenta de nuevo.';
  }
}

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`,
    withCredentials: true, // sends httpOnly refresh cookie
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000,
  });

  // Request interceptor — inject access token from localStorage
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (stored) {
        try {
          const { token } = JSON.parse(stored) as { token: string };
          if (token) config.headers.set('Authorization', `Bearer ${token}`);
        } catch {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      }
    }
    return config;
  });

  // Response interceptor — unwrap `data` envelope, normalize errors
  instance.interceptors.response.use(
    (response) => {
      // Unwrap { success, data } envelope from the backend
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return { ...response, data: response.data.data };
      }
      return response;
    },
    (error: AxiosError) => {
      const message = extractErrorMessage(error);
      return Promise.reject(new ApiError(error.response?.status ?? 0, message));
    },
  );

  return instance;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = createApiClient();
