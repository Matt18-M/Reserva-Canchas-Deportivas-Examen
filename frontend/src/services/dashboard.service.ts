import api from '@/lib/axios';
import type { ApiResponse, AuthUser } from '@/modules/auth/types';

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

export type ReservationStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'CANCELADA'
  | 'COMPLETADA';

export type PaymentStatus = 'PENDIENTE' | 'PAGADO' | 'FALLIDO' | 'REEMBOLSADO';

export type Reservation = {
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
  user: AuthUser;
  court: {
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
};

export type Payment = {
  id: number;
  monto: string;
  estado: PaymentStatus;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'PAYPHONE' | null;
  referencia: string | null;
  fechaPago: string | null;
  reservaId: number;
  createdAt: string;
  updatedAt: string;
  reservation: {
    id: number;
    codigo: string;
    fechaInicio: string;
    fechaFin: string;
    duracionHoras: number;
    estado: ReservationStatus;
    montoTotal: string;
    usuarioId: number;
    canchaId: number;
  };
};

export const dashboardService = {
  getUsers: async (): Promise<AuthUser[]> => {
    const { data } = await api.get<ApiResponse<AuthUser[]>>('/users');
    return data.data;
  },

  getCourts: async (): Promise<Court[]> => {
    const { data } = await api.get<ApiResponse<Court[]>>('/courts');
    return data.data;
  },

  getReservations: async (): Promise<Reservation[]> => {
    const { data } = await api.get<ApiResponse<Reservation[]>>('/reservations');
    return data.data;
  },

  getPayments: async (): Promise<Payment[]> => {
    const { data } = await api.get<ApiResponse<Payment[]>>('/payments');
    return data.data;
  },
};

export default dashboardService;
