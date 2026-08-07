import type {
  PaymentDisplayStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/services/payments.service';

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'PAYPHONE', label: 'PayPhone' },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'FALLIDO', label: 'Fallido' },
  { value: 'REEMBOLSADO', label: 'Reembolsado' },
] as const;

export const PAYMENT_DISPLAY_STATUS_OPTIONS = [
  { value: 'SIN_REGISTRAR', label: 'Sin registrar' },
  ...PAYMENT_STATUS_OPTIONS,
] as const;

export const getPaymentMethodLabel = (method: PaymentMethod): string =>
  PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;

export const getPaymentStatusLabel = (status: PaymentStatus): string =>
  PAYMENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

export const getPaymentDisplayStatusLabel = (status: PaymentDisplayStatus): string =>
  PAYMENT_DISPLAY_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

export const PAYMENT_RESERVATION_STATUS_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
] as const;

export const getPaymentReservationStatusLabel = (status: string): string =>
  PAYMENT_RESERVATION_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

export const getPaymentProcessObservation = (status: PaymentDisplayStatus): string => {
  switch (status) {
    case 'SIN_REGISTRAR':
      return 'El cliente todavía no ha registrado un comprobante de pago.\n\nSe encuentra esperando el registro del pago.\n\nHasta que exista un pago registrado no podrán habilitarse acciones administrativas.';
    case 'PENDIENTE':
      return 'Pago registrado por el cliente.\n\nPendiente de aprobación administrativa.';
    case 'PAGADO':
      return 'El pago fue aprobado.\n\nLa reserva puede confirmarse desde el módulo de Reservas.';
    case 'FALLIDO':
      return 'El comprobante fue rechazado.\n\nSe espera un nuevo registro de pago por parte del cliente.';
    case 'REEMBOLSADO':
      return 'El pago fue reembolsado.';
    default:
      return '';
  }
};

export const getPaymentAdminActions = (
  status: PaymentDisplayStatus,
): PaymentStatus[] => {
  switch (status) {
    case 'PENDIENTE':
      return ['PAGADO', 'FALLIDO'];
    case 'FALLIDO':
      return ['PAGADO'];
    case 'PAGADO':
      return ['REEMBOLSADO'];
    default:
      return [];
  }
};

export const formatPaymentDate = (value: string | null | undefined): string => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const formatCurrency = (value: string | number): string =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
