import api from '@/lib/axios';
import type { ApiResponse } from '@/modules/auth/types';

export type ReservationCourt = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precioHora: string;
  capacidad: number | null;
  ubicacion: string | null;
  imagen: string | null;
  activa: boolean;
  courtType: {
    id: number;
    nombre: string;
    descripcion: string | null;
  };
};

export type AvailabilitySlot = {
  fechaInicio: string;
  fechaFin: string;
};

export type CourtAvailability = {
  date: string;
  diaSemana: string;
  courtId: number;
  slotsLibres: AvailabilitySlot[];
};

export type BookableSlot = {
  fechaInicio: string;
  fechaFin: string;
};

export type CreateReservationPayload = {
  canchaId: number;
  fechaInicio: string;
  fechaFin: string;
  notas?: string;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'PAYPHONE';
  referencia?: string;
};

export type Reservation = {
  id: number;
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  duracionHoras: number;
  estado: ReservationStatus;
  notas: string | null;
  montoTotal: string;
  canchaId: number;
  createdAt: string;
};

export type ReservationStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

export type MyReservation = Reservation & {
  updatedAt: string;
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

const MS_PER_HOUR = 60 * 60 * 1000;

export const generateHourlySlots = (slotsLibres: AvailabilitySlot[]): BookableSlot[] => {
  const bookable: BookableSlot[] = [];
  const now = Date.now();

  for (const slot of slotsLibres) {
    let start = new Date(slot.fechaInicio);
    const end = new Date(slot.fechaFin);

    while (start.getTime() + MS_PER_HOUR <= end.getTime()) {
      const slotEnd = new Date(start.getTime() + MS_PER_HOUR);

      if (start.getTime() > now) {
        bookable.push({
          fechaInicio: start.toISOString(),
          fechaFin: slotEnd.toISOString(),
        });
      }

      start = slotEnd;
    }
  }

  return bookable;
};

export const reservationsService = {
  getCourts: async (): Promise<ReservationCourt[]> => {
    const { data } = await api.get<ApiResponse<ReservationCourt[]>>('/courts');
    return data.data;
  },

  getAvailability: async (courtId: number, date: string): Promise<CourtAvailability> => {
    const { data } = await api.get<ApiResponse<CourtAvailability>>(
      `/courts/${courtId}/availability`,
      { params: { date } },
    );
    return data.data;
  },

  create: async (payload: CreateReservationPayload): Promise<Reservation> => {
    const { data } = await api.post<ApiResponse<Reservation>>('/reservations', payload);
    return data.data;
  },

  getMine: async (): Promise<MyReservation[]> => {
    const { data } = await api.get<ApiResponse<MyReservation[]>>('/reservations/me');
    return data.data;
  },

  cancel: async (id: number): Promise<MyReservation> => {
    const { data } = await api.patch<ApiResponse<MyReservation>>(`/reservations/${id}/cancel`);
    return data.data;
  },
};

export default reservationsService;
