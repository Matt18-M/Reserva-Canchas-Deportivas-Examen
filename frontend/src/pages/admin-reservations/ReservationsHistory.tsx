import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import ReservationDetail from '@/pages/admin-reservations/ReservationDetail';
import ReservationsTable from '@/pages/admin-reservations/ReservationsTable';
import adminReservationsService, {
  type AdminReservation,
} from '@/services/admin-reservations.service';

const ReservationsHistory = () => {
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  const historyQuery = useQuery({
    queryKey: ['admin-reservations', 'history'],
    queryFn: adminReservationsService.getHistory,
  });

  const detailQuery = useQuery({
    queryKey: ['admin-reservations', 'detail', selectedReservationId],
    queryFn: () => adminReservationsService.getById(selectedReservationId!),
    enabled: selectedReservationId !== null,
  });

  const filteredReservations = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);

  const handleViewDetail = (reservation: AdminReservation) => {
    setSelectedReservationId(reservation.id);
  };

  const closeDetail = () => {
    setSelectedReservationId(null);
  };

  return (
    <div>
      <PageHeader
        title="Historial de reservas"
        description="Consulta las reservas completadas. Esta vista es de solo lectura."
      />

      {historyQuery.isLoading ? <Loading fullScreen label="Cargando historial..." /> : null}

      {!historyQuery.isLoading ? (
        <div className="space-y-6">
          {historyQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {getApiErrorMessage(historyQuery.error, 'No se pudo cargar el historial.')}
            </div>
          ) : null}

          {historyQuery.isSuccess ? (
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
            readOnly
            onClose={closeDetail}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ReservationsHistory;
