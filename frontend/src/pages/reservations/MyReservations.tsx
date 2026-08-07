import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import { getApiErrorMessage, useAuth } from '@/contexts/AuthContext';
import ReservationCard from '@/pages/reservations/ReservationCard';
import ReservationFilters, {
  type ReservationFiltersState,
} from '@/pages/reservations/ReservationFilters';
import ConfirmDialog from '@/pages/users/ConfirmDialog';
import reservationsService, { type MyReservation } from '@/services/reservations.service';

const MyReservations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [filters, setFilters] = useState<ReservationFiltersState>({
    status: '',
    date: '',
    code: '',
  });
  const [cancellingReservation, setCancellingReservation] = useState<MyReservation | null>(null);

  const reservationsQuery = useQuery({
    queryKey: ['reservations', 'me'],
    queryFn: reservationsService.getMine,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => reservationsService.cancel(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reservations', 'me'] });
      await queryClient.invalidateQueries({ queryKey: ['availability'] });
      await queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Reserva cancelada correctamente.');
      setCancellingReservation(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo cancelar la reserva.'));
    },
  });

  const reservations = reservationsQuery.data ?? [];

  const reservationStats = useMemo(() => {
    return {
      total: reservations.length,
      pending: reservations.filter((item) => item.estado === 'PENDIENTE').length,
      confirmed: reservations.filter((item) => item.estado === 'CONFIRMADA').length,
    };
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    const normalizedCode = filters.code.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const matchesStatus =
        filters.status.length === 0 || reservation.estado === filters.status;

      const reservationDate = reservation.fechaInicio.slice(0, 10);
      const matchesDate = filters.date.length === 0 || reservationDate === filters.date;

      const matchesCode =
        normalizedCode.length === 0 ||
        reservation.codigo.toLowerCase().includes(normalizedCode);

      return matchesStatus && matchesDate && matchesCode;
    });
  }, [reservations, filters]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Mis reservas"
        description={
          user
            ? `Hola ${user.nombre}, aquí puedes consultar tus reservas y reservar una nueva cancha.`
            : 'Consulta el historial de tus reservas y reserva una nueva cancha.'
        }
      />

      <div className="mt-6 space-y-6">
        <Card className="overflow-hidden border-primary-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#f0fdf4_100%)]">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm">
                <CalendarPlus className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text">¿Necesitas una cancha?</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Reserva en pocos pasos: elige cancha, fecha, horario y método de pago.
                </p>
              </div>
            </div>
            <Link to="/reservar" className="shrink-0">
              <Button variant="secondary" leftIcon={<CalendarPlus className="size-4" />}>
                Reservar cancha
              </Button>
            </Link>
          </CardContent>
        </Card>

        {reservationsQuery.isSuccess && reservations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Total
                </p>
                <p className="mt-1 text-2xl font-semibold text-text">{reservationStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Pendientes
                </p>
                <p className="mt-1 text-2xl font-semibold text-text">{reservationStats.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Confirmadas
                </p>
                <p className="mt-1 text-2xl font-semibold text-text">
                  {reservationStats.confirmed}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {reservationsQuery.isLoading ? (
          <Loading label="Cargando reservas..." className="py-12" />
        ) : null}

        {reservationsQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getApiErrorMessage(reservationsQuery.error, 'No se pudieron cargar tus reservas.')}
          </div>
        ) : null}

        {reservationsQuery.isSuccess && reservations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
              <CalendarDays className="size-10 text-text-muted" />
              <h3 className="mt-4 text-lg font-semibold text-text">Aún no tienes reservas</h3>
              <p className="mt-2 max-w-md text-sm text-text-muted">
                Cuando reserves una cancha, aparecerá aquí con su estado, pago y detalles.
              </p>
              <Link to="/reservar" className="mt-6">
                <Button variant="secondary">Reservar mi primera cancha</Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {reservationsQuery.isSuccess && reservations.length > 0 ? (
          <>
            <ReservationFilters filters={filters} onChange={setFilters} />

            {filteredReservations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-muted px-4 py-12 text-center">
                <p className="text-sm text-text-muted">
                  No se encontraron reservas con los filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={setCancellingReservation}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(cancellingReservation)}
        title="Cancelar reserva"
        description={
          cancellingReservation
            ? `¿Deseas cancelar la reserva "${cancellingReservation.codigo}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Cancelar reserva"
        variant="danger"
        isLoading={cancelMutation.isPending}
        onConfirm={() => {
          if (cancellingReservation) {
            cancelMutation.mutate(cancellingReservation.id);
          }
        }}
        onCancel={() => setCancellingReservation(null)}
      />
    </div>
  );
};

export default MyReservations;
