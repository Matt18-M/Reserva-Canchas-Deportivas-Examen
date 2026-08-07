import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import type { BookableSlot } from '@/services/reservations.service';
import { cn } from '@/utils/cn';

type AvailabilityGridProps = {
  slots: BookableSlot[];
  selectedSlot: BookableSlot | null;
  diaSemana?: string;
  isLoading?: boolean;
  error?: string | null;
  onSelect: (slot: BookableSlot) => void;
  onRetry?: () => void;
};

const formatTime = (value: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const AvailabilityGrid = ({
  slots,
  selectedSlot,
  diaSemana,
  isLoading = false,
  error = null,
  onSelect,
  onRetry,
}: AvailabilityGridProps) => {
  if (isLoading) {
    return <Loading label="Consultando disponibilidad..." className="py-12" />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <p className="text-sm text-danger">{error}</p>
          {onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Horarios disponibles</CardTitle>
          {diaSemana ? (
            <p className="text-sm text-text-muted capitalize">{diaSemana.toLowerCase()}</p>
          ) : null}
        </div>
        <Badge variant="success">{slots.length} slot(s)</Badge>
      </CardHeader>
      <CardContent>
        {slots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-muted px-4 py-10 text-center">
            <p className="text-sm text-text-muted">
              No hay horarios disponibles para la fecha seleccionada.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => {
              const isSelected =
                selectedSlot?.fechaInicio === slot.fechaInicio &&
                selectedSlot?.fechaFin === slot.fechaFin;

              return (
                <button
                  key={`${slot.fechaInicio}-${slot.fechaFin}`}
                  type="button"
                  onClick={() => onSelect(slot)}
                  className={cn(
                    'rounded-xl border px-4 py-4 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                      : 'border-border bg-surface hover:border-primary-300 hover:bg-surface-muted',
                  )}
                >
                  <p className="text-sm font-semibold text-text">
                    {formatTime(slot.fechaInicio)} — {formatTime(slot.fechaFin)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">Duración: 1 hora</p>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityGrid;
