import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import PaymentDetail from '@/pages/payments/PaymentDetail';
import PaymentFilters, { type PaymentFiltersState } from '@/pages/payments/PaymentFilters';
import PaymentTable from '@/pages/payments/PaymentTable';
import { getPaymentStatusLabel } from '@/pages/payments/payment.constants';
import ConfirmDialog from '@/pages/users/ConfirmDialog';
import type { AuthUser } from '@/modules/auth/types';
import paymentsService, {
  getPaymentDisplayStatus,
  type PaymentOverview,
  type PaymentStatus,
} from '@/services/payments.service';
import usersService from '@/services/users.service';

type StatusChangeAction = {
  paymentId: number;
  status: PaymentStatus;
};

const Payments = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PaymentFiltersState>({
    paymentStatus: '',
    reservationStatus: '',
    search: '',
  });
  const [selectedItem, setSelectedItem] = useState<PaymentOverview | null>(null);
  const [statusChangeAction, setStatusChangeAction] = useState<StatusChangeAction | null>(null);

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: paymentsService.getAll,
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
  });

  const usersById = useMemo(() => {
    const map = new Map<number, AuthUser>();
    for (const user of usersQuery.data ?? []) {
      map.set(user.id, user);
    }
    return map;
  }, [usersQuery.data]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return (paymentsQuery.data ?? []).filter((item) => {
      const displayStatus = getPaymentDisplayStatus(item);
      const user = usersById.get(item.reservation.usuarioId);
      const clientName = user ? `${user.nombre} ${user.apellido}`.toLowerCase() : '';

      const matchesPaymentStatus =
        filters.paymentStatus.length === 0 || displayStatus === filters.paymentStatus;

      const matchesReservationStatus =
        filters.reservationStatus.length === 0 ||
        item.reservation.estado === filters.reservationStatus;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.reservation.codigo.toLowerCase().includes(normalizedSearch) ||
        clientName.includes(normalizedSearch);

      return matchesPaymentStatus && matchesReservationStatus && matchesSearch;
    });
  }, [filters, paymentsQuery.data, usersById]);

  const statusMutation = useMutation({
    mutationFn: ({ paymentId, status }: StatusChangeAction) =>
      paymentsService.updateStatus(paymentId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-reservations'] }),
      ]);
      toast.success('Estado del pago actualizado correctamente.');
      setStatusChangeAction(null);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el estado.'));
    },
  });

  const handleViewDetail = (item: PaymentOverview) => {
    setSelectedItem(item);
  };

  const closeDetail = () => {
    setSelectedItem(null);
  };

  const handleStatusChangeRequest = (paymentId: number, status: PaymentStatus) => {
    setStatusChangeAction({ paymentId, status });
  };

  const handleConfirmStatusChange = () => {
    if (!statusChangeAction) {
      return;
    }

    statusMutation.mutate(statusChangeAction);
  };

  const selectedUser = selectedItem
    ? (usersById.get(selectedItem.reservation.usuarioId) ?? null)
    : null;

  const isPageLoading = paymentsQuery.isLoading || usersQuery.isLoading;

  return (
    <div>
      <PageHeader
        title="Pagos"
        description="Administración del proceso de pagos."
      />

      {isPageLoading ? <Loading fullScreen label="Cargando pagos..." /> : null}

      {!isPageLoading ? (
        <div className="space-y-6">
          <PaymentFilters filters={filters} onChange={setFilters} />

          {paymentsQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {getApiErrorMessage(paymentsQuery.error, 'No se pudieron cargar los pagos.')}
            </div>
          ) : null}

          {paymentsQuery.isSuccess ? (
            <PaymentTable
              items={filteredItems}
              usersById={usersById}
              onViewDetail={handleViewDetail}
              onStatusChange={handleStatusChangeRequest}
              isUpdating={statusMutation.isPending}
            />
          ) : null}
        </div>
      ) : null}

      {selectedItem ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-text/30 backdrop-blur-sm"
            aria-label="Cerrar modal"
            onClick={closeDetail}
          />
          <PaymentDetail
            item={selectedItem}
            user={selectedUser}
            isUpdating={statusMutation.isPending}
            onClose={closeDetail}
            onStatusChange={handleStatusChangeRequest}
          />
        </div>
      ) : null}

      {statusChangeAction ? (
        <ConfirmDialog
          open={Boolean(statusChangeAction)}
          title="Cambiar estado del pago"
          description={`¿Deseas cambiar el estado a "${getPaymentStatusLabel(statusChangeAction.status)}"?`}
          content="Esta acción actualizará el estado del pago en el sistema."
          confirmLabel="Confirmar cambio"
          variant={statusChangeAction.status === 'FALLIDO' ? 'danger' : 'primary'}
          isLoading={statusMutation.isPending}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setStatusChangeAction(null)}
        />
      ) : null}
    </div>
  );
};

export default Payments;
