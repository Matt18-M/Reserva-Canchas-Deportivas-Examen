import Button from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  formatCurrency,
  getPaymentMethodLabel,
} from '@/pages/payments/payment.constants';
import type { PaymentMethod } from '@/services/payments.service';
import type { BookableSlot, ReservationCourt } from '@/services/reservations.service';
import { cn } from '@/utils/cn';

const WIZARD_PAYMENT_METHODS: PaymentMethod[] = ['TRANSFERENCIA', 'EFECTIVO', 'TARJETA'];

type ReservationPaymentStepProps = {
  court: ReservationCourt;
  date: string;
  slot: BookableSlot;
  estimatedTotal: number;
  metodoPago: PaymentMethod | '';
  referencia: string;
  isSubmitting?: boolean;
  onMetodoPagoChange: (value: PaymentMethod) => void;
  onReferenciaChange: (value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
};

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T12:00:00`));

const formatTime = (value: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border/70 py-3 last:border-b-0">
    <span className="text-sm text-text-muted">{label}</span>
    <span className="text-right text-sm font-medium text-text">{value}</span>
  </div>
);

const ReservationPaymentStep = ({
  court,
  date,
  slot,
  estimatedTotal,
  metodoPago,
  referencia,
  isSubmitting = false,
  onMetodoPagoChange,
  onReferenciaChange,
  onConfirm,
  onBack,
}: ReservationPaymentStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Método de pago</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border border-border bg-surface-muted p-4">
          <SummaryRow label="Cancha" value={`${court.codigo} — ${court.nombre}`} />
          <SummaryRow label="Fecha" value={formatDate(date)} />
          <SummaryRow
            label="Horario"
            value={`${formatTime(slot.fechaInicio)} — ${formatTime(slot.fechaFin)}`}
          />
          <SummaryRow label="Total a pagar" value={formatCurrency(estimatedTotal)} />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-text">Selecciona el método de pago</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {WIZARD_PAYMENT_METHODS.map((method) => {
              const isSelected = metodoPago === method;

              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => onMetodoPagoChange(method)}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-border bg-surface text-text hover:border-primary-300 hover:bg-surface-muted',
                  )}
                >
                  {getPaymentMethodLabel(method)}
                </button>
              );
            })}
          </div>
        </div>

        {metodoPago === 'TRANSFERENCIA' ? (
          <div className="space-y-2">
            <label htmlFor="referencia" className="text-sm font-medium text-text">
              Referencia de transferencia (opcional)
            </label>
            <input
              id="referencia"
              type="text"
              maxLength={100}
              value={referencia}
              onChange={(event) => onReferenciaChange(event.target.value)}
              placeholder="Número de transacción o comprobante"
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            />
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Volver
        </Button>
        <Button
          variant="secondary"
          onClick={onConfirm}
          isLoading={isSubmitting}
          disabled={!metodoPago}
        >
          Confirmar reserva
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReservationPaymentStep;
