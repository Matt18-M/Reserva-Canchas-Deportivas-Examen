import { useQuery } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import ReservationDetail from '@/pages/admin-reservations/ReservationDetail';
import ReservationFilters, {
  EMPTY_ADMIN_RESERVATION_FILTERS,
  filterAdminReservations,
  getReservationStatusLabel,
  type AdminReservationFiltersState,
} from '@/pages/admin-reservations/ReservationFilters';
import ReservationsTable from '@/pages/admin-reservations/ReservationsTable';
import adminReservationsService, {
  type AdminReservation,
  type ReservationStatus,
} from '@/services/admin-reservations.service';
import schedulesService from '@/services/schedules.service';
import usersService from '@/services/users.service';
import { cn } from '@/utils/cn';

const HISTORY_STATUS_SUMMARY: ReservationStatus[] = [
  'PENDIENTE',
  'CONFIRMADA',
  'COMPLETADA',
  'CANCELADA',
];

const statusSummaryStyles: Record<
  ReservationStatus,
  { card: string; icon: string; value: string }
> = {
  PENDIENTE: {
    card: 'border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50',
    icon: 'bg-amber-100 text-amber-700',
    value: 'text-amber-800',
  },
  CONFIRMADA: {
    card: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50/50',
    icon: 'bg-emerald-100 text-emerald-700',
    value: 'text-emerald-800',
  },
  COMPLETADA: {
    card: 'border-primary-200/80 bg-gradient-to-br from-primary-50 to-secondary-50/50',
    icon: 'bg-primary-100 text-primary-700',
    value: 'text-primary-800',
  },
  CANCELADA: {
    card: 'border-red-200/80 bg-gradient-to-br from-red-50 to-rose-50/50',
    icon: 'bg-red-100 text-red-700',
    value: 'text-red-800',
  },
};

const statusSummaryIcons: Record<ReservationStatus, typeof Clock3> = {
  PENDIENTE: Clock3,
  CONFIRMADA: CheckCircle2,
  COMPLETADA: CalendarDays,
  CANCELADA: XCircle,
};

const ReservationsHistory = () => {
  const [filters, setFilters] = useState<AdminReservationFiltersState>(
    EMPTY_ADMIN_RESERVATION_FILTERS,
  );
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  const historyQuery = useQuery({
    queryKey: ['admin-reservations', 'history'],
    queryFn: adminReservationsService.getHistory,
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
  });

  const courtsQuery = useQuery({
    queryKey: ['courts', 'admin'],
    queryFn: schedulesService.getAdminCourts,
  });

  const detailQuery = useQuery({
    queryKey: ['admin-reservations', 'detail', selectedReservationId],
    queryFn: () => adminReservationsService.getById(selectedReservationId!),
    enabled: selectedReservationId !== null,
  });

  const filteredReservations = useMemo(
    () => filterAdminReservations(historyQuery.data ?? [], filters),
    [historyQuery.data, filters],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<ReservationStatus, number> = {
      PENDIENTE: 0,
      CONFIRMADA: 0,
      COMPLETADA: 0,
      CANCELADA: 0,
    };

    for (const reservation of filteredReservations) {
      counts[reservation.estado] += 1;
    }

    return counts;
  }, [filteredReservations]);

  const handleViewDetail = (reservation: AdminReservation) => {
    setSelectedReservationId(reservation.id);
  };

  const closeDetail = () => {
    setSelectedReservationId(null);
  };

  const isPageLoading =
    historyQuery.isLoading || usersQuery.isLoading || courtsQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de reservas"
        description="Consulta el registro completo de reservas. Filtra por estado, usuario, cancha o fecha."
      />

      {isPageLoading ? <Loading fullScreen label="Cargando historial..." /> : null}

      {!isPageLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {HISTORY_STATUS_SUMMARY.map((status) => {
              const Icon = statusSummaryIcons[status];
              const styles = statusSummaryStyles[status];

              return (
                <div
                  key={status}
                  className={cn(
                    'rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                    styles.card,
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                        {getReservationStatusLabel(status)}
                      </p>
                      <p className={cn('mt-1 text-2xl font-bold', styles.value)}>
                        {statusCounts[status]}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'flex size-10 items-center justify-center rounded-xl',
                        styles.icon,
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <ReservationFilters
            filters={filters}
            users={usersQuery.data ?? []}
            courts={courtsQuery.data ?? []}
            variant="history"
            onChange={setFilters}
          />

          {historyQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {getApiErrorMessage(historyQuery.error, 'No se pudo cargar el historial.')}
            </div>
          ) : null}

          {historyQuery.isSuccess ? (
            <ReservationsTable
              reservations={filteredReservations}
              onViewDetail={handleViewDetail}
              title={`Todas las reservas (${filteredReservations.length})`}
              animated
            />
          ) : null}
        </>
      ) : null}

      {selectedReservationId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-text/30 backdrop-blur-sm"
            aria-label="Cerrar modal"
            onClick={closeDetail}
          />
          <ReservationDetail
            reservation={detailQuery.data ?? null}
            isLoading={detailQuery.isLoading}
            readOnly
            onClose={closeDetail}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ReservationsHistory;
