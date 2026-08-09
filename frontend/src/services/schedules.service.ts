import api from '@/lib/axios';
import type { ApiResponse } from '@/modules/auth/types';

export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO';

export type Schedule = {
  id: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  canchaId: number;
  createdAt: string;
  updatedAt: string;
};

export type CourtSummary = {
  id: number;
  codigo: string;
  nombre: string;
  activa: boolean;
};

export type ScheduleWithCourt = Schedule & {
  court: CourtSummary;
};

export type CreateSchedulePayload = {
  canchaId: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
};

export type UpdateSchedulePayload = {
  canchaId?: number;
  diaSemana?: DiaSemana;
  horaInicio?: string;
  horaFin?: string;
};

export const schedulesService = {
  getAdminCourts: async (): Promise<CourtSummary[]> => {
    const { data } = await api.get<ApiResponse<CourtSummary[]>>('/courts/admin');
    return data.data;
  },

  getByCourt: async (courtId: number): Promise<Schedule[]> => {
    const { data } = await api.get<ApiResponse<Schedule[]>>(`/courts/${courtId}/schedules`);
    return data.data;
  },

  getByCourtAdmin: async (courtId: number): Promise<Schedule[]> => {
    const { data } = await api.get<ApiResponse<Schedule[]>>(`/courts/${courtId}/schedules/admin`);
    return data.data;
  },

  getById: async (id: number): Promise<Schedule> => {
    const { data } = await api.get<ApiResponse<Schedule>>(`/schedules/${id}`);
    return data.data;
  },

  create: async (payload: CreateSchedulePayload): Promise<Schedule> => {
    const { data } = await api.post<ApiResponse<Schedule>>('/schedules', payload);
    return data.data;
  },

  update: async (id: number, payload: UpdateSchedulePayload): Promise<Schedule> => {
    const { data } = await api.put<ApiResponse<Schedule>>(`/schedules/${id}`, payload);
    return data.data;
  },

  updateStatus: async (id: number, activo: boolean): Promise<Schedule> => {
    const { data } = await api.patch<ApiResponse<Schedule>>(`/schedules/${id}/status`, {
      activo,
    });
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/schedules/${id}`);
  },
};

export default schedulesService;
