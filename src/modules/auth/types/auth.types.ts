export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CooperativeMembership {
  cooperativeId: string;
  cooperativeName: string;
  memberCode: string | null;
  roles: string[];
}
export interface IUserRole {
  id: string;
  key: string;
  name: string;
  description: string;  
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  dni: string | null;
  isActive: boolean;
  isSuperadmin: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  cooperatives: CooperativeMembership[];
  userRoles: string[];
  subscriptionTier: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    isSuperadmin: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface TRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface TRegisterResponse {
  userId: string;
  email: string;
  requiresEmailVerification: true;
}

export interface TVerifyEmailPayload {
  userId: string;
  code: string;
}

export interface TVerifyEmailResponse {
  success: true;
  alreadyVerified?: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerifiedAt: string;
  };
}

export interface TResendVerificationPayload {
  userId: string;
}

export interface TRequestRegistrationPayload {
  email: string;
}

export interface TRequestRegistrationResponse {
  message: string;
}

export interface TCompleteRegistrationPayload {
  email: string;
  code: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface TValidateRegistrationCodePayload {
  email: string;
  code: string;
}

export interface TValidateRegistrationCodeResponse {
  message: string;
}

export interface TCompleteRegistrationResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    isSuperadmin: boolean;
  };
}
