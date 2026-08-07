import { useQuery } from '@tanstack/react-query';
import {
  CalendarCheck2,
  CalendarClock,
  CreditCard,
  MapPin,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react';
import { useMemo, type ReactNode } from 'react';

import Badge from '@/components/ui/Badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import dashboardService, {
  type Reservation,
  type ReservationStatus,
} from '@/services/dashboard.service';

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const reservationBadgeVariant = (
  estado: ReservationStatus,
): 'warning' | 'success' | 'danger' | 'primary' => {
  switch (estado) {
    case 'PENDIENTE':
      return 'warning';
    case 'CONFIRMADA':
      return 'success';
    case 'CANCELADA':
      return 'danger';
    default:
      return 'primary';
  }
};

type QueryStateProps = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  children: ReactNode;
  loadingLabel: string;
  errorLabel: string;
};

const QueryState = ({
  isLoading,
  isError,
  error,
  children,
  loadingLabel,
  errorLabel,
}: QueryStateProps) => {
  if (isLoading) {
    return <Loading label={loadingLabel} className="py-8" />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {getApiErrorMessage(error, errorLabel)}
      </div>
    );
  }

  return <>{children}</>;
};

const getLatestReservations = (reservations: Reservation[]): Reservation[] =>
  [...reservations]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
    .slice(0, 5);

const Dashboard = () => {
  const usersQuery = useQuery({
    queryKey: ['dashboard', 'users'],
    queryFn: dashboardService.getUsers,
  });

  const courtsQuery = useQuery({
    queryKey: ['dashboard', 'courts'],
    queryFn: dashboardService.getCourts,
  });

  const reservationsQuery = useQuery({
    queryKey: ['dashboard', 'reservations'],
    queryFn: dashboardService.getReservations,
  });

  const paymentsQuery = useQuery({
    queryKey: ['dashboard', 'payments'],
    queryFn: dashboardService.getPayments,
  });

  const reservationStats = useMemo(() => {
    const reservations = reservationsQuery.data ?? [];

    return {
      total: reservations.length,
      pending: reservations.filter((item) => item.estado === 'PENDIENTE').length,
      confirmed: reservations.filter((item) => item.estado === 'CONFIRMADA').length,
      latest: getLatestReservations(reservations),
    };
  }, [reservationsQuery.data]);

  const paymentStats = useMemo(() => {
    const payments = paymentsQuery.data ?? [];

    return {
      total: payments.length,
      pending: payments.filter((item) => item.estado === 'PENDIENTE').length,
      paid: payments.filter((item) => item.estado === 'PAGADO').length,
    };
  }, [paymentsQuery.data]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen general del sistema de reservas de canchas deportivas."
      />

      <section className="mb-8">
        <QueryState
          isLoading={usersQuery.isLoading}
          isError={usersQuery.isError}
          error={usersQuery.error}
          loadingLabel="Cargando usuarios..."
          errorLabel="No se pudieron cargar los usuarios."
        >
          {usersQuery.isSuccess ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Usuarios"
                value={usersQuery.data.length}
                icon={Users}
                description="Usuarios registrados en el sistema"
              />
            </div>
          ) : null}
        </QueryState>
      </section>

      <section className="mb-8">
        <QueryState
          isLoading={courtsQuery.isLoading}
          isError={courtsQuery.isError}
          error={courtsQuery.error}
          loadingLabel="Cargando canchas..."
          errorLabel="No se pudieron cargar las canchas."
        >
          {courtsQuery.isSuccess ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Canchas"
                value={courtsQuery.data.length}
                icon={MapPin}
                description="Canchas activas disponibles"
              />
            </div>
          ) : null}
        </QueryState>
      </section>

      <section className="mb-8 space-y-4">
        <QueryState
          isLoading={reservationsQuery.isLoading}
          isError={reservationsQuery.isError}
          error={reservationsQuery.error}
          loadingLabel="Cargando reservas..."
          errorLabel="No se pudieron cargar las reservas."
        >
          {reservationsQuery.isSuccess ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  title="Total Reservas"
                  value={reservationStats.total}
                  icon={CalendarClock}
                  description="Reservas registradas"
                />
                <StatCard
                  title="Reservas Pendientes"
                  value={reservationStats.pending}
                  icon={CalendarClock}
                  description="Esperando confirmación o pago"
                />
                <StatCard
                  title="Reservas Confirmadas"
                  value={reservationStats.confirmed}
                  icon={CalendarCheck2}
                  description="Reservas confirmadas"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Últimas 5 reservas</CardTitle>
                  <CardDescription>
                    Reservas más recientes registradas en el sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reservationStats.latest.length === 0 ? (
                    <p className="text-sm text-text-muted">
                      No hay reservas registradas todavía.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-border text-text-muted">
                            <th className="px-3 py-3 font-medium">Código</th>
                            <th className="px-3 py-3 font-medium">Usuario</th>
                            <th className="px-3 py-3 font-medium">Cancha</th>
                            <th className="px-3 py-3 font-medium">Fecha</th>
                            <th className="px-3 py-3 font-medium">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservationStats.latest.map((reservation) => (
                            <tr
                              key={reservation.id}
                              className="border-b border-border/70 last:border-b-0"
                            >
                              <td className="px-3 py-3 font-medium text-text">
                                {reservation.codigo}
                              </td>
                              <td className="px-3 py-3 text-text">
                                {reservation.user.nombre} {reservation.user.apellido}
                              </td>
                              <td className="px-3 py-3 text-text">
                                {reservation.court.nombre}
                              </td>
                              <td className="px-3 py-3 text-text-muted">
                                {formatDateTime(reservation.fechaInicio)}
                              </td>
                              <td className="px-3 py-3">
                                <Badge variant={reservationBadgeVariant(reservation.estado)}>
                                  {reservation.estado}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </QueryState>
      </section>

      <section>
        <QueryState
          isLoading={paymentsQuery.isLoading}
          isError={paymentsQuery.isError}
          error={paymentsQuery.error}
          loadingLabel="Cargando pagos..."
          errorLabel="No se pudieron cargar los pagos."
        >
          {paymentsQuery.isSuccess ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Total Pagos"
                value={paymentStats.total}
                icon={CreditCard}
                description="Pagos registrados"
              />
              <StatCard
                title="Pagos Pendientes"
                value={paymentStats.pending}
                icon={Wallet}
                description="Pagos aún no completados"
              />
              <StatCard
                title="Pagos Pagados"
                value={paymentStats.paid}
                icon={Receipt}
                description="Pagos confirmados"
              />
            </div>
          ) : null}
        </QueryState>
      </section>
    </div>
  );
};

export default Dashboard;
