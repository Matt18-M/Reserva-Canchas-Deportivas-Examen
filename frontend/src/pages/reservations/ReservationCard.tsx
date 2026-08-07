import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock3, CreditCard, StickyNote } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import PaymentForm from '@/pages/payments/PaymentForm';
import {
  formatCurrency,
  formatPaymentDate,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '@/pages/payments/payment.constants';
import type { PaymentFormValues } from '@/pages/payments/payment.schema';
import { RESERVATION_STATUS_OPTIONS } from '@/pages/reservations/ReservationFilters';
import type { MyReservation, ReservationStatus } from '@/services/reservations.service';
import paymentsService, { type PaymentStatus } from '@/services/payments.service';

type ReservationCardProps = {
  reservation: MyReservation;
  onCancel: (reservation: MyReservation) => void;
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

const paymentStatusVariantMap: Record<PaymentStatus, 'success' | 'danger' | 'warning'> = {
  PENDIENTE: 'warning',
  PAGADO: 'success',
  FALLIDO: 'danger',
  REEMBOLSADO: 'warning',
};

const getStatusLabel = (status: ReservationStatus): string =>
  RESERVATION_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));

const formatTime = (value: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 text-text-muted">{icon}</span>
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-sm text-text">{value}</p>
    </div>
  </div>
);

const ReservationCard = ({ reservation, onCancel }: ReservationCardProps) => {
  const queryClient = useQueryClient();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const paymentQuery = useQuery({
    queryKey: ['payments', 'reservation', reservation.id],
    queryFn: () => paymentsService.getByReservation(reservation.id),
  });

  const createPaymentMutation = useMutation({
    mutationFn: (values: PaymentFormValues) =>
      paymentsService.create({
        reservaId: reservation.id,
        metodoPago: values.metodoPago,
        referencia: values.referencia?.trim() ? values.referencia.trim() : undefined,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({
          queryKey: ['payments', 'reservation', reservation.id],
        }),
        queryClient.invalidateQueries({ queryKey: ['reservations', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-reservations'] }),
      ]);
      toast.success('Pago registrado correctamente.');
      setShowPaymentForm(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo registrar el pago.'));
    },
  });

  const canCancel = reservation.estado === 'PENDIENTE';
  const canRegisterPayment =
    paymentQuery.isSuccess &&
    !paymentQuery.data &&
    (reservation.estado === 'PENDIENTE' || reservation.estado === 'CONFIRMADA');

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {reservation.codigo}
            </p>
            <CardTitle className="mt-1">
              {reservation.court.codigo} — {reservation.court.nombre}
            </CardTitle>
            <p className="mt-1 text-sm text-text-muted">{reservation.court.courtType.nombre}</p>
          </div>
          <Badge variant={statusVariantMap[reservation.estado]}>
            {getStatusLabel(reservation.estado)}
          </Badge>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2">
          <DetailRow
            icon={<CalendarDays className="size-4" />}
            label="Fecha"
            value={formatDate(reservation.fechaInicio)}
          />
          <DetailRow
            icon={<Clock3 className="size-4" />}
            label="Horario"
            value={`${formatTime(reservation.fechaInicio)} — ${formatTime(reservation.fechaFin)}`}
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Monto</p>
            <p className="mt-1 text-lg font-semibold text-text">
              {formatCurrency(reservation.montoTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Duración</p>
            <p className="mt-1 text-sm text-text">{reservation.duracionHoras} hora(s)</p>
          </div>
          {reservation.notas ? (
            <div className="sm:col-span-2">
              <DetailRow
                icon={<StickyNote className="size-4" />}
                label="Notas"
                value={reservation.notas}
              />
            </div>
          ) : null}

          <div className="sm:col-span-2 rounded-xl border border-border bg-surface-muted p-4">
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="size-4 text-text-muted" />
              <p className="text-sm font-semibold text-text">Información de pago</p>
            </div>

            {paymentQuery.isLoading ? (
              <Loading label="Consultando pago..." className="py-4" />
            ) : null}

            {paymentQuery.isError ? (
              <p className="text-sm text-danger">
                {getApiErrorMessage(paymentQuery.error, 'No se pudo consultar el pago.')}
              </p>
            ) : null}

            {paymentQuery.isSuccess && paymentQuery.data ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Monto
                  </p>
                  <p className="mt-1 text-sm font-medium text-text">
                    {formatCurrency(paymentQuery.data.monto)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Método
                  </p>
                  <p className="mt-1 text-sm text-text">
                    {paymentQuery.data.metodoPago
                      ? getPaymentMethodLabel(paymentQuery.data.metodoPago)
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Referencia
                  </p>
                  <p className="mt-1 text-sm text-text">
                    {paymentQuery.data.referencia ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Estado
                  </p>
                  <div className="mt-1">
                    <Badge variant={paymentStatusVariantMap[paymentQuery.data.estado]}>
                      {getPaymentStatusLabel(paymentQuery.data.estado)}
                    </Badge>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Fecha
                  </p>
                  <p className="mt-1 text-sm text-text">
                    {formatPaymentDate(paymentQuery.data.fechaPago)}
                  </p>
                </div>
              </div>
            ) : null}

            {canRegisterPayment ? (
              <div className="mt-4">
                <Button variant="secondary" size="sm" onClick={() => setShowPaymentForm(true)}>
                  Registrar pago
                </Button>
              </div>
            ) : null}

            {paymentQuery.isSuccess && !paymentQuery.data && !canRegisterPayment ? (
              <p className="text-sm text-text-muted">No hay pago registrado para esta reserva.</p>
            ) : null}

            {paymentQuery.isSuccess && !paymentQuery.data && canRegisterPayment ? (
              <p className="mb-3 text-sm text-text-muted">Aún no se ha registrado el pago.</p>
            ) : null}
          </div>
        </CardContent>

        {canCancel ? (
          <CardFooter className="justify-end">
            <Button variant="danger" size="sm" onClick={() => onCancel(reservation)}>
              Cancelar reserva
            </Button>
          </CardFooter>
        ) : null}
      </Card>

      {showPaymentForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-text/30 backdrop-blur-sm"
            aria-label="Cerrar modal"
            onClick={() => setShowPaymentForm(false)}
          />
          <Card className="relative z-10 w-full max-w-lg shadow-lg">
            <PaymentForm
              reservationCode={reservation.codigo}
              amount={formatCurrency(reservation.montoTotal)}
              isSubmitting={createPaymentMutation.isPending}
              onSubmit={(values) => createPaymentMutation.mutate(values)}
              onCancel={() => setShowPaymentForm(false)}
            />
          </Card>
        </div>
      ) : null}
    </>
  );
};

export default ReservationCard;
