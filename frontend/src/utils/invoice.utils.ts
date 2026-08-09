import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '@/pages/payments/payment.constants';
import { getReservationStatusLabel } from '@/pages/admin-reservations/ReservationFilters';
import type { AdminReservation } from '@/services/admin-reservations.service';
import type { AuthUser } from '@/modules/auth/types';
import type { PaymentMethod, PaymentOverview, PaymentStatus } from '@/services/payments.service';
import type { ReservationStatus } from '@/services/admin-reservations.service';
import type { InvoiceData } from '@/types/invoice';

const formatInvoiceDate = (value: Date = new Date()): string =>
  new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(value);

const formatInvoiceDateTime = (value: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const buildInvoiceNumber = (reservationCode: string, reservationId: number): string => {
  const suffix = reservationCode.replace(/^RES-?/i, '').toUpperCase();
  return `FAC-${suffix || reservationId}`;
};

export const buildInvoiceFromReservation = (reservation: AdminReservation): InvoiceData => {
  const payment = reservation.payment;
  const unitPrice = Number(reservation.montoTotal) / reservation.duracionHoras;

  return {
    invoiceNumber: buildInvoiceNumber(reservation.codigo, reservation.id),
    issueDate: formatInvoiceDate(),
    reservationCode: reservation.codigo,
    clientName: `${reservation.user.nombre} ${reservation.user.apellido}`,
    clientEmail: reservation.user.email,
    clientPhone: reservation.user.telefono,
    courtCode: reservation.court.codigo,
    courtName: reservation.court.nombre,
    courtType: reservation.court.courtType.nombre,
    courtLocation: reservation.court.ubicacion,
    startDate: formatInvoiceDateTime(reservation.fechaInicio),
    endDate: formatInvoiceDateTime(reservation.fechaFin),
    durationHours: reservation.duracionHoras,
    unitPrice: unitPrice.toFixed(2),
    total: reservation.montoTotal,
    paymentMethod: payment?.metodoPago
      ? getPaymentMethodLabel(payment.metodoPago as PaymentMethod)
      : null,
    paymentReference: payment?.referencia ?? null,
    paymentStatus: payment ? getPaymentStatusLabel(payment.estado as PaymentStatus) : 'Sin registrar',
    reservationStatus: getReservationStatusLabel(reservation.estado),
  };
};

export const buildInvoiceFromPaymentOverview = (
  item: PaymentOverview,
  user: AuthUser | null,
): InvoiceData => {
  const payment = item.payment;
  const unitPrice =
    Number(item.reservation.montoTotal) / Math.max(item.reservation.duracionHoras, 1);

  return {
    invoiceNumber: buildInvoiceNumber(item.reservation.codigo, item.reservation.id),
    issueDate: formatInvoiceDate(),
    reservationCode: item.reservation.codigo,
    clientName: user ? `${user.nombre} ${user.apellido}` : 'Cliente no disponible',
    clientEmail: user?.email ?? '—',
    clientPhone: user?.telefono ?? null,
    courtCode: item.reservation.court.codigo,
    courtName: item.reservation.court.nombre,
    courtType: '—',
    courtLocation: null,
    startDate: formatInvoiceDateTime(item.reservation.fechaInicio),
    endDate: formatInvoiceDateTime(item.reservation.fechaFin),
    durationHours: item.reservation.duracionHoras,
    unitPrice: unitPrice.toFixed(2),
    total: payment?.monto ?? item.reservation.montoTotal,
    paymentMethod: payment?.metodoPago ? getPaymentMethodLabel(payment.metodoPago) : null,
    paymentReference: payment?.referencia ?? null,
    paymentStatus: payment ? getPaymentStatusLabel(payment.estado) : 'Sin registrar',
    reservationStatus: getReservationStatusLabel(
      item.reservation.estado as ReservationStatus,
    ),
  };
};

export const formatInvoiceCurrency = (value: string | number): string =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
