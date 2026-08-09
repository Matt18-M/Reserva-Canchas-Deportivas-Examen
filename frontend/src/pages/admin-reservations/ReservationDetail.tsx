import { Printer } from 'lucide-react';
import { useState } from 'react';

import InvoicePreviewModal from '@/components/invoice/InvoicePreviewModal';
import Button from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import {
  formatPaymentDate,
  getPaymentMethodLabel,
} from '@/pages/payments/payment.constants';
import {
  getReservationStatusLabel,
  RESERVATION_STATUS_OPTIONS,
} from '@/pages/admin-reservations/ReservationFilters';
import type { AdminReservation, ReservationStatus } from '@/services/admin-reservations.service';
import type { PaymentMethod } from '@/services/payments.service';
import { buildInvoiceFromReservation } from '@/utils/invoice.utils';

type ReservationDetailProps = {
  reservation: AdminReservation | null;
  isLoading?: boolean;
  isUpdating?: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onStatusChange?: (status: ReservationStatus) => void;
};

const statusVariantMap: Record<
  ReservationStatus,
  'warning' | 'success' | 'danger' | 'primary'
> = {
  PENDIENTE: 'warning',
  CONFIRMADA: 'success',
  CANCELADA: 'danger',
  COMPLETADA: 'primary',
};

const getNextStatuses = (current: ReservationStatus): ReservationStatus[] => {
  switch (current) {
    case 'PENDIENTE':
      return ['CONFIRMADA', 'CANCELADA'];
    case 'CONFIRMADA':
      return ['COMPLETADA', 'CANCELADA'];
    default:
      return [];
  }
};

const hasApprovedPayment = (reservation: AdminReservation): boolean =>
  reservation.payment?.estado === 'PAGADO';

const getReservationObservation = (reservation: AdminReservation): string => {
  if (reservation.estado === 'CANCELADA') {
    return 'Reserva cancelada.';
  }

  if (reservation.estado === 'COMPLETADA') {
    return 'Reserva finalizada.';
  }

  if (hasApprovedPayment(reservation)) {
    return 'Pago registrado correctamente.';
  }

  if (reservation.payment) {
    return 'El pago aún no está aprobado.';
  }

  return 'No existe ningún pago registrado.';
};

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const formatCurrency = (value: string): string =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border/70 py-3 last:border-b-0">
    <span className="text-sm text-text-muted">{label}</span>
    <span className="text-right text-sm font-medium text-text">{value}</span>
  </div>
);

const ReservationDetail = ({
  reservation,
  isLoading = false,
  isUpdating = false,
  readOnly = false,
  onClose,
  onStatusChange,
}: ReservationDetailProps) => {
  const [invoiceData, setInvoiceData] = useState(
    () => null as ReturnType<typeof buildInvoiceFromReservation> | null,
  );

  if (isLoading) {
    return (
      <Card className="relative z-10 w-full max-w-2xl shadow-lg">
        <Loading label="Cargando detalle..." className="py-12" />
      </Card>
    );
  }

  if (!reservation) {
    return null;
  }

  const nextStatuses = readOnly ? [] : getNextStatuses(reservation.estado);
  const observation = getReservationObservation(reservation);
  const payment = reservation.payment ?? null;
  const approvedPayment = hasApprovedPayment(reservation);
  const requiresApprovedPayment = (status: ReservationStatus): boolean =>
    status === 'CONFIRMADA' || status === 'COMPLETADA';

  return (
    <>
      <Card className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Detalle de reserva</CardTitle>
            <CardDescription>{reservation.codigo}</CardDescription>
          </div>
          <Badge variant={statusVariantMap[reservation.estado]}>
            {getReservationStatusLabel(reservation.estado)}
          </Badge>
        </div>
        <div className="mt-4 rounded-xl border border-border bg-surface-muted px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Observación
          </p>
          <p className="mt-1 text-sm text-text">{observation}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-xl border border-border bg-surface-muted p-4">
          <DetailRow
            label="Usuario"
            value={`${reservation.user.nombre} ${reservation.user.apellido}`}
          />
          <DetailRow label="Correo" value={reservation.user.email} />
          <DetailRow label="Teléfono" value={reservation.user.telefono ?? '—'} />
          <DetailRow
            label="Cancha"
            value={`${reservation.court.codigo} — ${reservation.court.nombre}`}
          />
          <DetailRow label="Tipo de cancha" value={reservation.court.courtType.nombre} />
          <DetailRow label="Ubicación" value={reservation.court.ubicacion ?? '—'} />
          <DetailRow label="Inicio" value={formatDateTime(reservation.fechaInicio)} />
          <DetailRow label="Fin" value={formatDateTime(reservation.fechaFin)} />
          <DetailRow label="Duración" value={`${reservation.duracionHoras} hora(s)`} />
          <DetailRow label="Monto total" value={formatCurrency(reservation.montoTotal)} />
          <DetailRow label="Notas" value={reservation.notas ?? '—'} />
          <DetailRow label="Creada" value={formatDateTime(reservation.createdAt)} />
        </div>

        {payment ? (
          <div className="rounded-xl border border-border bg-surface-muted p-4">
            <p className="mb-2 text-sm font-semibold text-text">Pago</p>
            <DetailRow label="Estado" value={payment.estado} />
            <DetailRow label="Referencia" value={payment.referencia ?? '—'} />
            <DetailRow
              label="Método"
              value={
                payment.metodoPago
                  ? getPaymentMethodLabel(payment.metodoPago as PaymentMethod)
                  : '—'
              }
            />
            <DetailRow
              label="Fecha de pago"
              value={payment.fechaPago ? formatPaymentDate(payment.fechaPago) : '—'}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface-muted p-4">
            <p className="mb-2 text-sm font-semibold text-text">Pago</p>
            <p className="text-sm text-text-muted">No existe ningún pago registrado.</p>
          </div>
        )}

        {nextStatuses.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-text">Cambiar estado</p>
            {!approvedPayment &&
            nextStatuses.some((status) => requiresApprovedPayment(status)) ? (
              <p className="text-sm text-text-muted">
                Debe existir un pago aprobado antes de confirmar la reserva.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => {
                const label = RESERVATION_STATUS_OPTIONS.find(
                  (option) => option.value === status,
                )?.label;
                const disabled =
                  isUpdating ||
                  (requiresApprovedPayment(status) && !approvedPayment);

                return (
                  <Button
                    key={status}
                    variant={status === 'CANCELADA' ? 'danger' : 'secondary'}
                    size="sm"
                    disabled={disabled}
                    onClick={() => onStatusChange?.(status)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <Button
          variant="secondary"
          leftIcon={<Printer className="size-4" />}
          onClick={() => setInvoiceData(buildInvoiceFromReservation(reservation))}
          disabled={isUpdating}
        >
          Imprimir factura
        </Button>
        <Button variant="outline" onClick={onClose} disabled={isUpdating}>
          Cerrar
        </Button>
      </CardFooter>
      </Card>

      <InvoicePreviewModal data={invoiceData} onClose={() => setInvoiceData(null)} />
    </>
  );
};

export default ReservationDetail;
