import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { extractErrorMessage } from '@/@common/utils/extract-error-message';

const ACCESS_TOKEN_KEY = 'cultiv_at';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export const API_URL = process.env.NEXT_PUBLIC_API_URL
function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: `${API_URL}/api/v1`,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000,
    // Serialize arrays as repeated params: plotIds=a&plotIds=b
    paramsSerializer: (params: Record<string, unknown>) => {
      const sp = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          value.forEach((v) => sp.append(key, String(v)));
        } else if (value !== undefined && value !== null) {
          sp.append(key, String(value));
        }
      }
      return sp.toString();
    },
  });

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

  instance.interceptors.response.use(
    (response) => {
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return { ...response, data: response.data.data };
      }
      return response;
    },
    (error: AxiosError) => {
      // Only fire session:expired if the request actually had an auth token.
      // A 401 on login (no token) means wrong credentials, not an expired session.
      const hadToken = !!error.config?.headers?.['Authorization'];
      if (error.response?.status === 401 && hadToken && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('session:expired'));
      }
      const message = extractErrorMessage(error);
      return Promise.reject(new ApiError(error.response?.status ?? 0, message));
    },
  );

  return instance;
}

export const apiClient = createApiClient();
