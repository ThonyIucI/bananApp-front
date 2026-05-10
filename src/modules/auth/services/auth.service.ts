import { apiClient } from '@/lib/api/client';
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  TRegisterPayload,
  TRegisterResponse,
  TVerifyEmailPayload,
  TVerifyEmailResponse,
  TResendVerificationPayload,
  TRequestRegistrationPayload,
  TRequestRegistrationResponse,
  TCompleteRegistrationPayload,
  TCompleteRegistrationResponse,
} from '../types/auth.types';

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

export const registerRequest = (payload: TRegisterPayload) =>
  apiClient.post<TRegisterResponse>('/auth/register', payload);

export const verifyEmailRequest = (payload: TVerifyEmailPayload) =>
  apiClient.post<TVerifyEmailResponse>('/auth/verify-email', payload);

export const resendVerificationRequest = (payload: TResendVerificationPayload) =>
  apiClient.post<{ success: true }>('/auth/resend-verification', payload);

export const requestRegistrationRequest = (payload: TRequestRegistrationPayload) =>
  apiClient.post<TRequestRegistrationResponse>('/auth/request-registration', payload);

export const completeRegistrationRequest = (payload: TCompleteRegistrationPayload) =>
  apiClient.post<TCompleteRegistrationResponse>('/auth/complete-registration', payload);
