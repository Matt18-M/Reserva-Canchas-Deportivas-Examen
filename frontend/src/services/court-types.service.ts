import api from '@/lib/axios';
import type { ApiResponse } from '@/modules/auth/types';

export type CourtType = {
  id: number;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCourtTypePayload = {
  nombre: string;
  descripcion?: string;
};

export type UpdateCourtTypePayload = {
  nombre?: string;
  descripcion?: string;
};

export const courtTypesService = {
  getAll: async (): Promise<CourtType[]> => {
    const { data } = await api.get<ApiResponse<CourtType[]>>('/court-types');
    return data.data;
  },

  getById: async (id: number): Promise<CourtType> => {
    const { data } = await api.get<ApiResponse<CourtType>>(`/court-types/${id}`);
    return data.data;
  },

  create: async (payload: CreateCourtTypePayload): Promise<CourtType> => {
    const { data } = await api.post<ApiResponse<CourtType>>('/court-types', payload);
    return data.data;
  },

  update: async (id: number, payload: UpdateCourtTypePayload): Promise<CourtType> => {
    const { data } = await api.put<ApiResponse<CourtType>>(
      `/court-types/${id}`,
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/court-types/${id}`);
  },
};

export default courtTypesService;
