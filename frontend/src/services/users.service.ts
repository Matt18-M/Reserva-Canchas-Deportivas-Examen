import api from '@/lib/axios';
import type { ApiResponse, AuthUser } from '@/modules/auth/types';

export type UpdateUserPayload = {
  nombre: string;
  apellido: string;
  telefono?: string;
  fotoPerfil?: string;
};

export type UpdateUserStatusPayload = {
  activo: boolean;
};

export const usersService = {
  getAll: async (): Promise<AuthUser[]> => {
    const { data } = await api.get<ApiResponse<AuthUser[]>>('/users');
    return data.data;
  },

  getById: async (id: number): Promise<AuthUser> => {
    const { data } = await api.get<ApiResponse<AuthUser>>(`/users/${id}`);
    return data.data;
  },

  update: async (id: number, payload: UpdateUserPayload): Promise<AuthUser> => {
    const { data } = await api.put<ApiResponse<AuthUser>>(`/users/${id}`, payload);
    return data.data;
  },

  updateStatus: async (
    id: number,
    payload: UpdateUserStatusPayload,
  ): Promise<AuthUser> => {
    const { data } = await api.patch<ApiResponse<AuthUser>>(
      `/users/${id}/status`,
      payload,
    );
    return data.data;
  },
};

export default usersService;
