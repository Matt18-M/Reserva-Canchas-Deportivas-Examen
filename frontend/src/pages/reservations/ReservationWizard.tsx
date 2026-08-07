import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import AvailabilityGrid from '@/pages/reservations/AvailabilityGrid';
import ReservationPaymentStep from '@/pages/reservations/ReservationPaymentStep';
import ReservationSummary from '@/pages/reservations/ReservationSummary';
import type { PaymentMethod } from '@/services/payments.service';
import reservationsService, {
  generateHourlySlots,
  type BookableSlot,
  type ReservationCourt,
} from '@/services/reservations.service';
import { cn } from '@/utils/cn';

type WizardStep = 'court' | 'date' | 'slots' | 'summary' | 'payment' | 'success';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'court', label: 'Cancha' },
  { id: 'date', label: 'Fecha' },
  { id: 'slots', label: 'Horario' },
  { id: 'summary', label: 'Resumen' },
  { id: 'payment', label: 'Pago' },
];

const formatCurrency = (value: string): string =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));

const getMinDate = (): string => {
  const today = new Date();
  return today.toISOString().slice(0, 10);
};

const ReservationWizard = () => {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<WizardStep>('court');
  const [selectedCourt, setSelectedCourt] = useState<ReservationCourt | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<BookableSlot | null>(null);
  const [notas, setNotas] = useState('');
  const [metodoPago, setMetodoPago] = useState<PaymentMethod | ''>('');
  const [referencia, setReferencia] = useState('');
  const [shouldFetchAvailability, setShouldFetchAvailability] = useState(false);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);

  const courtsQuery = useQuery({
    queryKey: ['courts', 'public'],
    queryFn: reservationsService.getCourts,
  });

  const availabilityQuery = useQuery({
    queryKey: ['availability', selectedCourt?.id, selectedDate],
    queryFn: () => reservationsService.getAvailability(selectedCourt!.id, selectedDate),
    enabled: Boolean(selectedCourt && selectedDate && shouldFetchAvailability),
  });

  const bookableSlots = useMemo(
    () => generateHourlySlots(availabilityQuery.data?.slotsLibres ?? []),
    [availabilityQuery.data?.slotsLibres],
  );

  const createMutation = useMutation({
    mutationFn: reservationsService.create,
    onSuccess: async (reservation) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['availability'] }),
        queryClient.invalidateQueries({ queryKey: ['reservations', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-reservations'] }),
      ]);
      toast.success('Reserva y pago registrados correctamente.');
      setConfirmedCode(reservation.codigo);
      setStep('success');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo confirmar la reserva.'));
    },
  });

  const resetWizard = () => {
    setStep('court');
    setSelectedCourt(null);
    setSelectedDate('');
    setSelectedSlot(null);
    setNotas('');
    setMetodoPago('');
    setReferencia('');
    setShouldFetchAvailability(false);
    setConfirmedCode(null);
  };

  const handleConsultAvailability = () => {
    if (!selectedCourt || !selectedDate) {
      toast.error('Selecciona una cancha y una fecha.');
      return;
    }

    setSelectedSlot(null);
    setShouldFetchAvailability(true);
    setStep('slots');
  };

  const handleConfirmReservation = () => {
    if (!selectedCourt || !selectedSlot || !metodoPago) {
      toast.error('Selecciona un método de pago.');
      return;
    }

    createMutation.mutate({
      canchaId: selectedCourt.id,
      fechaInicio: selectedSlot.fechaInicio,
      fechaFin: selectedSlot.fechaFin,
      notas: notas.trim() ? notas.trim() : undefined,
      metodoPago,
      referencia:
        metodoPago === 'TRANSFERENCIA' && referencia.trim()
          ? referencia.trim()
          : undefined,
    });
  };

  const estimatedTotal = selectedCourt ? Number(selectedCourt.precioHora) : 0;

  const currentStepIndex = STEPS.findIndex((item) => item.id === step);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Reservar cancha"
        description="Selecciona cancha, fecha, horario y método de pago para completar tu reserva."
      />

      {step !== 'success' ? (
        <div className="mb-8 mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STEPS.map((item, index) => {
            const isActive = item.id === step;
            const isCompleted = index < currentStepIndex;

            return (
              <div
                key={item.id}
                className={cn(
                  'rounded-xl border px-3 py-3 text-center text-sm font-medium',
                  isActive
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : isCompleted
                      ? 'border-primary-200 bg-surface text-text'
                      : 'border-border bg-surface-muted text-text-muted',
                )}
              >
                {index + 1}. {item.label}
              </div>
            );
          })}
        </div>
      ) : null}

      {courtsQuery.isLoading ? <Loading fullScreen label="Cargando canchas..." /> : null}

      {courtsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(courtsQuery.error, 'No se pudieron cargar las canchas.')}
        </div>
      ) : null}

      {step === 'court' && courtsQuery.isSuccess ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {courtsQuery.data.map((court) => {
              const isSelected = selectedCourt?.id === court.id;

              return (
                <button
                  key={court.id}
                  type="button"
                  onClick={() => setSelectedCourt(court)}
                  className={cn(
                    'rounded-xl border p-5 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                      : 'border-border bg-surface hover:border-primary-300 hover:bg-surface-muted',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                        {court.codigo}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-text">{court.nombre}</h3>
                      <p className="mt-1 text-sm text-text-muted">{court.courtType.nombre}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary-700">
                      {formatCurrency(court.precioHora)}/h
                    </span>
                  </div>
                  {court.ubicacion ? (
                    <p className="mt-3 flex items-center gap-2 text-sm text-text-muted">
                      <MapPin className="size-4" />
                      {court.ubicacion}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              variant="secondary"
              disabled={!selectedCourt}
              onClick={() => setStep('date')}
            >
              Continuar
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'date' && selectedCourt ? (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar fecha</CardTitle>
            <CardDescription>
              Cancha seleccionada: {selectedCourt.codigo} — {selectedCourt.nombre}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reservation-date" className="text-sm font-medium text-text">
                Fecha de la reserva
              </label>
              <div className="relative max-w-sm">
                <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="reservation-date"
                  type="date"
                  min={getMinDate()}
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setShouldFetchAvailability(false);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    'h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-text',
                    'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                  )}
                />
              </div>
            </div>
          </CardContent>
          <div className="flex justify-between gap-2 px-6 pb-6">
            <Button variant="outline" onClick={() => setStep('court')}>
              Volver
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Search className="size-4" />}
              disabled={!selectedDate}
              onClick={handleConsultAvailability}
            >
              Consultar disponibilidad
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 'slots' && selectedCourt ? (
        <div className="space-y-4">
          <AvailabilityGrid
            slots={bookableSlots}
            selectedSlot={selectedSlot}
            diaSemana={availabilityQuery.data?.diaSemana}
            isLoading={availabilityQuery.isLoading}
            error={
              availabilityQuery.isError
                ? getApiErrorMessage(
                    availabilityQuery.error,
                    'No se pudo consultar la disponibilidad.',
                  )
                : null
            }
            onSelect={setSelectedSlot}
            onRetry={() => {
              void availabilityQuery.refetch();
            }}
          />

          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setStep('date')}>
              Volver
            </Button>
            <Button
              variant="secondary"
              disabled={!selectedSlot || availabilityQuery.isLoading}
              onClick={() => setStep('summary')}
            >
              Ver resumen
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'summary' && selectedCourt && selectedSlot && selectedDate ? (
        <ReservationSummary
          court={selectedCourt}
          date={selectedDate}
          slot={selectedSlot}
          notas={notas}
          estimatedTotal={estimatedTotal}
          onNotasChange={setNotas}
          onConfirm={() => setStep('payment')}
          onBack={() => setStep('slots')}
        />
      ) : null}

      {step === 'payment' && selectedCourt && selectedSlot && selectedDate ? (
        <ReservationPaymentStep
          court={selectedCourt}
          date={selectedDate}
          slot={selectedSlot}
          estimatedTotal={estimatedTotal}
          metodoPago={metodoPago}
          referencia={referencia}
          isSubmitting={createMutation.isPending}
          onMetodoPagoChange={(value) => {
            setMetodoPago(value);
            if (value !== 'TRANSFERENCIA') {
              setReferencia('');
            }
          }}
          onReferenciaChange={setReferencia}
          onConfirm={handleConfirmReservation}
          onBack={() => setStep('summary')}
        />
      ) : null}

      {step === 'success' ? (
        <Card className="text-center">
          <CardContent className="space-y-4 py-10">
            <CheckCircle2 className="mx-auto size-12 text-success" />
            <div>
              <h2 className="text-xl font-semibold text-text">Reserva confirmada</h2>
              <p className="mt-2 text-sm text-text-muted">
                Tu reserva y pago fueron registrados correctamente. El pago quedará pendiente
                de aprobación administrativa.
              </p>
              {confirmedCode ? (
                <p className="mt-3 text-sm font-medium text-text">
                  Código de reserva: <span className="text-primary-700">{confirmedCode}</span>
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="secondary" onClick={resetWizard}>
                Nueva reserva
              </Button>
              <Link to="/mis-reservas">
                <Button variant="outline">Ver mis reservas</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ReservationWizard;
