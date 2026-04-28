import { apiClient } from '@/lib/api/client';
import type { AuthUser, LoginCredentials, LoginResponse } from '../types/auth.types';

export async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
}

export async function getProfileRequest(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>('/auth/profile');
  return response.data;
}

export async function getMeRequest(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>('/auth/me');
  return response.data;
}
