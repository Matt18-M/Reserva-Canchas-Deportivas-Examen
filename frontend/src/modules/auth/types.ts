export type UserRole = {
  id: number;
  nombre: 'ADMIN' | 'CLIENTE';
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  fotoPerfil: string | null;
  activo: boolean;
  rolId: number;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const AUTH_STORAGE_KEYS = {
  token: 'canchas_auth_token',
  user: 'canchas_auth_user',
} as const;

export type UserRoleName = AuthUser['role']['nombre'];
