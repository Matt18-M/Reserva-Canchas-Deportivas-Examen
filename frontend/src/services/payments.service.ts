import api from '@/lib/axios';
import type { ApiResponse } from '@/modules/auth/types';

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'PAYPHONE';
export type PaymentStatus = 'PENDIENTE' | 'PAGADO' | 'FALLIDO' | 'REEMBOLSADO';
export type PaymentDisplayStatus = PaymentStatus | 'SIN_REGISTRAR';

export type PaymentCourt = {
  id: number;
  codigo: string;
  nombre: string;
};

export type PaymentReservation = {
  id: number;
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  duracionHoras: number;
  estado: string;
  montoTotal: string;
  usuarioId: number;
  canchaId: number;
  court?: PaymentCourt;
};

export type PaymentRecord = {
  id: number;
  monto: string;
  estado: PaymentStatus;
  metodoPago: PaymentMethod | null;
  referencia: string | null;
  fechaPago: string | null;
  reservaId: number;
  createdAt: string;
  updatedAt: string;
};

export type PaymentOverviewReservation = PaymentReservation & {
  court: PaymentCourt;
};

export type PaymentOverview = {
  reservation: PaymentOverviewReservation;
  payment: PaymentRecord | null;
};

export type Payment = PaymentRecord & {
  reservation: PaymentReservation;
};

export type CreatePaymentPayload = {
  reservaId: number;
  metodoPago: PaymentMethod;
  referencia?: string;
};

export const getPaymentDisplayStatus = (item: PaymentOverview): PaymentDisplayStatus =>
  item.payment?.estado ?? 'SIN_REGISTRAR';

export const paymentsService = {
  getAll: async (): Promise<PaymentOverview[]> => {
    const { data } = await api.get<ApiResponse<PaymentOverview[]>>('/payments');
    return data.data;
  },

  getById: async (id: number): Promise<Payment> => {
    const { data } = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return data.data;
  },

  getByReservation: async (reservationId: number): Promise<Payment | null> => {
    const { data } = await api.get<ApiResponse<Payment | null>>(
      `/payments/reservation/${reservationId}`,
    );

    return data.data;
  },

  create: async (payload: CreatePaymentPayload): Promise<Payment> => {
    const { data } = await api.post<ApiResponse<Payment>>('/payments', payload);
    return data.data;
  },

  updateStatus: async (id: number, estado: PaymentStatus): Promise<Payment> => {
    const { data } = await api.patch<ApiResponse<Payment>>(`/payments/${id}/status`, {
      estado,
    });
    return data.data;
  },
};

export default paymentsService;
