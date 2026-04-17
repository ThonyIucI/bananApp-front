import { apiClient } from '@/lib/api/client';
import type { LoginCredentials, LoginResponse } from '../types/auth.types';

export async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
}
