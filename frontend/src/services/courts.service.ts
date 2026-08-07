import api from '@/lib/axios';
import type { ApiResponse } from '@/modules/auth/types';

export type Court = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precioHora: string;
  capacidad: number | null;
  ubicacion: string | null;
  imagen: string | null;
  activa: boolean;
  tipoCanchaId: number;
  createdAt: string;
  updatedAt: string;
  courtType: {
    id: number;
    nombre: string;
    descripcion: string | null;
  };
};

export type CreateCourtPayload = {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  precioHora: number;
  capacidad?: number;
  ubicacion?: string;
  imagen?: string;
  tipoCanchaId: number;
};

export type UpdateCourtPayload = {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  precioHora?: number;
  capacidad?: number;
  ubicacion?: string;
  imagen?: string;
  tipoCanchaId?: number;
};

export const courtsService = {
  getAll: async (): Promise<Court[]> => {
    const { data } = await api.get<ApiResponse<Court[]>>('/courts');
    return data.data;
  },

  getById: async (id: number): Promise<Court> => {
    const { data } = await api.get<ApiResponse<Court>>(`/courts/${id}`);
    return data.data;
  },

  create: async (payload: CreateCourtPayload): Promise<Court> => {
    const { data } = await api.post<ApiResponse<Court>>('/courts', payload);
    return data.data;
  },

  update: async (id: number, payload: UpdateCourtPayload): Promise<Court> => {
    const { data } = await api.put<ApiResponse<Court>>(`/courts/${id}`, payload);
    return data.data;
  },

  updateStatus: async (id: number, activa: boolean): Promise<Court> => {
    const { data } = await api.patch<ApiResponse<Court>>(`/courts/${id}/status`, {
      activa,
    });
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/courts/${id}`);
  },
};

export default courtsService;
