import Button from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import type { BookableSlot, ReservationCourt } from '@/services/reservations.service';
import { cn } from '@/utils/cn';

type ReservationSummaryProps = {
  court: ReservationCourt;
  date: string;
  slot: BookableSlot;
  notas: string;
  estimatedTotal: number;
  isSubmitting?: boolean;
  onNotasChange: (value: string) => void;
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

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border/70 py-3 last:border-b-0">
    <span className="text-sm text-text-muted">{label}</span>
    <span className="text-right text-sm font-medium text-text">{value}</span>
  </div>
);

const ReservationSummary = ({
  court,
  date,
  slot,
  notas,
  estimatedTotal,
  isSubmitting = false,
  onNotasChange,
  onConfirm,
  onBack,
}: ReservationSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de la reserva</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border bg-surface-muted p-4">
          <SummaryRow label="Cancha" value={`${court.codigo} — ${court.nombre}`} />
          <SummaryRow label="Tipo" value={court.courtType.nombre} />
          <SummaryRow label="Fecha" value={formatDate(date)} />
          <SummaryRow
            label="Horario"
            value={`${formatTime(slot.fechaInicio)} — ${formatTime(slot.fechaFin)}`}
          />
          <SummaryRow label="Duración" value="1 hora" />
          <SummaryRow label="Total estimado" value={formatCurrency(estimatedTotal)} />
        </div>

        <div className="space-y-2">
          <label htmlFor="notas" className="text-sm font-medium text-text">
            Notas (opcional)
          </label>
          <textarea
            id="notas"
            rows={3}
            maxLength={500}
            value={notas}
            onChange={(event) => onNotasChange(event.target.value)}
            placeholder="Agrega observaciones para tu reserva"
            className={cn(
              'w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text',
              'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
            )}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Volver
        </Button>
        <Button variant="secondary" onClick={onConfirm} disabled={isSubmitting}>
          Continuar al pago
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReservationSummary;
