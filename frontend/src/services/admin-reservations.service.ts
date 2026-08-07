import api from '@/lib/axios';
import type { ApiResponse } from '@/modules/auth/types';

export type ReservationStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

export type AdminReservationUser = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  fotoPerfil: string | null;
  activo: boolean;
};

export type AdminReservationCourt = {
  id: number;
  codigo: string;
  nombre: string;
  precioHora: string;
  activa: boolean;
  ubicacion: string | null;
  courtType: {
    id: number;
    nombre: string;
    descripcion: string | null;
  };
};

export type AdminReservationPayment = {
  id: number;
  monto: string;
  estado: string;
  metodoPago: string | null;
  referencia: string | null;
  fechaPago: string | null;
  reservaId: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminReservation = {
  id: number;
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  duracionHoras: number;
  estado: ReservationStatus;
  notas: string | null;
  montoTotal: string;
  usuarioId: number;
  canchaId: number;
  createdAt: string;
  updatedAt: string;
  hasPayment?: boolean;
  payment?: AdminReservationPayment | null;
  user: AdminReservationUser;
  court: AdminReservationCourt;
};

export type SearchReservationsParams = {
  estado?: ReservationStatus;
  usuarioId?: number;
  canchaId?: number;
  fechaInicio?: string;
  fechaFin?: string;
};

export const adminReservationsService = {
  getAll: async (): Promise<AdminReservation[]> => {
    const { data } = await api.get<ApiResponse<AdminReservation[]>>('/reservations');
    return data.data;
  },

  getHistory: async (): Promise<AdminReservation[]> => {
    const { data } = await api.get<ApiResponse<AdminReservation[]>>('/reservations/history');
    return data.data;
  },

  getById: async (id: number): Promise<AdminReservation> => {
    const { data } = await api.get<ApiResponse<AdminReservation>>(`/reservations/${id}`);
    return data.data;
  },

  search: async (params: SearchReservationsParams): Promise<AdminReservation[]> => {
    const { data } = await api.get<ApiResponse<AdminReservation[]>>('/reservations/search', {
      params,
    });
    return data.data;
  },

  updateStatus: async (id: number, estado: ReservationStatus): Promise<AdminReservation> => {
    const { data } = await api.patch<ApiResponse<AdminReservation>>(
      `/reservations/${id}/status`,
      { estado },
    );
    return data.data;
  },
};

export default adminReservationsService;
