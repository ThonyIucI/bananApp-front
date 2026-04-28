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
