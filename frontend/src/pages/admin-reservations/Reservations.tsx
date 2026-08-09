import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import ReservationDetail from '@/pages/admin-reservations/ReservationDetail';
import ReservationFilters, {
  type AdminReservationFiltersState,
  EMPTY_ADMIN_RESERVATION_FILTERS,
  getReservationStatusLabel,
} from '@/pages/admin-reservations/ReservationFilters';
import ReservationsTable from '@/pages/admin-reservations/ReservationsTable';
import ConfirmDialog from '@/pages/users/ConfirmDialog';
import adminReservationsService, {
  type AdminReservation,
  type ReservationStatus,
  type SearchReservationsParams,
} from '@/services/admin-reservations.service';
import schedulesService from '@/services/schedules.service';
import usersService from '@/services/users.service';

const buildSearchParams = (
  filters: AdminReservationFiltersState,
): SearchReservationsParams | null => {
  const hasServerFilter =
    filters.estado.length > 0 ||
    filters.usuarioId.length > 0 ||
    filters.canchaId.length > 0 ||
    filters.date.length > 0;

  if (!hasServerFilter) {
    return null;
  }

  const params: SearchReservationsParams = {};

  if (filters.estado) {
    params.estado = filters.estado as ReservationStatus;
  }

  if (filters.usuarioId) {
    params.usuarioId = Number(filters.usuarioId);
  }

  if (filters.canchaId) {
    params.canchaId = Number(filters.canchaId);
  }

  if (filters.date) {
    params.fechaInicio = `${filters.date}T00:00:00.000Z`;
    params.fechaFin = `${filters.date}T23:59:59.999Z`;
  }

  return params;
};

type StatusChangeAction = {
  reservationId: number;
  status: ReservationStatus;
};

const Reservations = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AdminReservationFiltersState>(
    EMPTY_ADMIN_RESERVATION_FILTERS,
  );
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [statusChangeAction, setStatusChangeAction] = useState<StatusChangeAction | null>(null);

  const searchParams = useMemo(() => buildSearchParams(filters), [filters]);

  const reservationsQuery = useQuery({
    queryKey: ['admin-reservations', searchParams],
    queryFn: () =>
      searchParams
        ? adminReservationsService.search(searchParams)
        : adminReservationsService.getAll(),
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

  const statusMutation = useMutation({
    mutationFn: ({ reservationId, status }: StatusChangeAction) =>
      adminReservationsService.updateStatus(reservationId, status),
    onSuccess: async (updatedReservation) => {
      await queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      await queryClient.invalidateQueries({
        queryKey: ['admin-reservations', 'detail', updatedReservation.id],
      });
      if (updatedReservation.estado === 'COMPLETADA') {
        await queryClient.invalidateQueries({ queryKey: ['admin-reservations', 'history'] });
      }
      toast.success('Estado de la reserva actualizado correctamente.');
      setStatusChangeAction(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el estado.'));
    },
  });

  const filteredReservations = reservationsQuery.data ?? [];

  const handleViewDetail = (reservation: AdminReservation) => {
    setSelectedReservationId(reservation.id);
  };

  const closeDetail = () => {
    setSelectedReservationId(null);
  };

  const handleStatusChangeRequest = (status: ReservationStatus) => {
    if (!detailQuery.data) {
      return;
    }

    setStatusChangeAction({
      reservationId: detailQuery.data.id,
      status,
    });
  };

  const handleConfirmStatusChange = () => {
    if (!statusChangeAction) {
      return;
    }

    statusMutation.mutate(statusChangeAction);
  };

  const isPageLoading =
    reservationsQuery.isLoading || usersQuery.isLoading || courtsQuery.isLoading;

  return (
    <div>
      <PageHeader
        title="Reservas"
        description="Administra las reservas registradas en el sistema."
      />

      {isPageLoading ? <Loading fullScreen label="Cargando reservas..." /> : null}

      {!isPageLoading ? (
        <div className="space-y-6">
          <ReservationFilters
            filters={filters}
            users={usersQuery.data ?? []}
            courts={courtsQuery.data ?? []}
            onChange={setFilters}
          />

          {reservationsQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {getApiErrorMessage(reservationsQuery.error, 'No se pudieron cargar las reservas.')}
            </div>
          ) : null}

          {reservationsQuery.isSuccess ? (
            <ReservationsTable
              reservations={filteredReservations}
              onViewDetail={handleViewDetail}
            />
          ) : null}
        </div>
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
            isUpdating={statusMutation.isPending}
            onClose={closeDetail}
            onStatusChange={handleStatusChangeRequest}
          />
        </div>
      ) : null}

      {statusChangeAction ? (
        <ConfirmDialog
          open={Boolean(statusChangeAction)}
          title="Cambiar estado de reserva"
          description={`¿Deseas cambiar el estado a "${getReservationStatusLabel(statusChangeAction.status)}"?`}
          confirmLabel="Confirmar cambio"
          variant={statusChangeAction.status === 'CANCELADA' ? 'danger' : 'primary'}
          isLoading={statusMutation.isPending}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setStatusChangeAction(null)}
        />
      ) : null}
    </div>
  );
};

export default Reservations;
