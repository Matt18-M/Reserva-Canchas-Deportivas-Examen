import api from '@/lib/axios';
import type {
  ApiResponse,
  AuthUser,
  LoginResponse,
} from '@/modules/auth/types';
import type {
  LoginFormValues,
  RegisterFormValues,
} from '@/modules/auth/schemas';

export const loginRequest = async (
  payload: LoginFormValues,
): Promise<LoginResponse> => {
  const { data } = await api.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    payload,
  );

  return data.data;
};

export const registerRequest = async (
  payload: RegisterFormValues,
): Promise<AuthUser> => {
  const { data } = await api.post<ApiResponse<AuthUser>>(
    '/auth/register',
    payload,
  );

  return data.data;
};

const CLIENTE_PATHS = ['/reservar', '/mis-reservas'] as const;

export const getRedirectPathByRole = (
  role: AuthUser['role']['nombre'],
  from?: string,
): string => {
  if (role === 'ADMIN') {
    return '/admin';
  }

  if (from && CLIENTE_PATHS.includes(from as (typeof CLIENTE_PATHS)[number])) {
    return from;
  }

  return '/mis-reservas';
};
