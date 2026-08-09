import { useQuery } from '@tanstack/react-query';
import {
  CalendarCheck2,
  CalendarClock,
  CreditCard,
  MapPin,
  Receipt,
  Sparkles,
  TrendingUp,
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
import StatCard from '@/components/ui/StatCard';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import { getReservationStatusLabel } from '@/pages/admin-reservations/ReservationFilters';
import dashboardService, {
  type Reservation,
  type ReservationStatus,
} from '@/services/dashboard.service';
import { cn } from '@/utils/cn';

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

const statusBorderMap: Record<ReservationStatus, string> = {
  PENDIENTE: 'border-l-amber-400',
  CONFIRMADA: 'border-l-emerald-500',
  CANCELADA: 'border-l-red-400',
  COMPLETADA: 'border-l-primary-500',
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

  const isLoading =
    usersQuery.isLoading ||
    courtsQuery.isLoading ||
    reservationsQuery.isLoading ||
    paymentsQuery.isLoading;

  const hasError =
    usersQuery.isError ||
    courtsQuery.isError ||
    reservationsQuery.isError ||
    paymentsQuery.isError;

  const firstError =
    usersQuery.error ??
    courtsQuery.error ??
    reservationsQuery.error ??
    paymentsQuery.error;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 p-6 text-white shadow-lg sm:p-8">
        <div className="dashboard-shimmer pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 size-32 rounded-full bg-secondary-300/20 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              Panel administrativo
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
                Resumen visual del sistema de reservas de canchas deportivas.
              </p>
            </div>
          </div>

          <div className="grid min-w-[220px] gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-white/70">Reservas activas</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
                {reservationStats.total}
                <TrendingUp className="size-4 text-primary-200" />
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-white/70">Pagos confirmados</p>
              <p className="mt-1 text-2xl font-bold">{paymentStats.paid}</p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? <Loading fullScreen label="Cargando dashboard..." /> : null}

      {hasError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(firstError, 'No se pudo cargar el dashboard.')}
        </div>
      ) : null}

      {!isLoading && !hasError ? (
        <>
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary-500 to-secondary-400" />
              <div>
                <h2 className="text-lg font-semibold text-text">Resumen general</h2>
                <p className="text-sm text-text-muted">
                  Indicadores clave de usuarios, canchas, reservas y pagos.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total usuarios"
                value={usersQuery.data?.length ?? 0}
                icon={Users}
                description="Usuarios registrados"
                variant="users"
                className="animate-fade-in-up opacity-0"
              />
              <StatCard
                title="Total canchas"
                value={courtsQuery.data?.length ?? 0}
                icon={MapPin}
                description="Canchas activas disponibles"
                variant="courts"
                className="animate-fade-in-up opacity-0 [animation-delay:60ms]"
              />
              <StatCard
                title="Total reservas"
                value={reservationStats.total}
                icon={CalendarClock}
                description="Reservas registradas"
                variant="reservations"
                className="animate-fade-in-up opacity-0 [animation-delay:120ms]"
              />
              <StatCard
                title="Total pagos"
                value={paymentStats.total}
                icon={CreditCard}
                description="Pagos registrados"
                variant="payments"
                className="animate-fade-in-up opacity-0 [animation-delay:180ms]"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-amber-400 to-emerald-500" />
              <div>
                <h2 className="text-lg font-semibold text-text">Estado operativo</h2>
                <p className="text-sm text-text-muted">
                  Seguimiento de reservas y pagos pendientes o confirmados.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Reservas pendientes"
                value={reservationStats.pending}
                icon={CalendarClock}
                description="Esperando confirmación o pago"
                variant="warning"
                className="animate-fade-in-up opacity-0 [animation-delay:240ms]"
              />
              <StatCard
                title="Reservas confirmadas"
                value={reservationStats.confirmed}
                icon={CalendarCheck2}
                description="Listas para jugar"
                variant="success"
                className="animate-fade-in-up opacity-0 [animation-delay:300ms]"
              />
              <StatCard
                title="Pagos pendientes"
                value={paymentStats.pending}
                icon={Wallet}
                description="Por aprobar o registrar"
                variant="warning"
                className="animate-fade-in-up opacity-0 [animation-delay:360ms]"
              />
              <StatCard
                title="Pagos confirmados"
                value={paymentStats.paid}
                icon={Receipt}
                description="Ingresos procesados"
                variant="success"
                className="animate-fade-in-up opacity-0 [animation-delay:420ms]"
              />
            </div>
          </section>

          <section>
            <Card className="overflow-hidden border-primary-200/60 shadow-sm">
              <CardHeader className="border-b border-primary-100/60 bg-gradient-to-r from-primary-50/80 via-white to-secondary-50/60">
                <CardTitle>Últimas 5 reservas</CardTitle>
                <CardDescription>
                  Actividad reciente registrada en el sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <QueryState
                  isLoading={reservationsQuery.isLoading}
                  isError={reservationsQuery.isError}
                  error={reservationsQuery.error}
                  loadingLabel="Cargando reservas..."
                  errorLabel="No se pudieron cargar las reservas."
                >
                  {reservationStats.latest.length === 0 ? (
                    <p className="px-6 py-8 text-sm text-text-muted">
                      No hay reservas registradas todavía.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-primary-100/80 bg-gradient-to-r from-primary-50/70 via-secondary-50/30 to-primary-50/50 text-primary-800/75">
                            <th className="px-4 py-3 font-medium">Código</th>
                            <th className="px-4 py-3 font-medium">Usuario</th>
                            <th className="px-4 py-3 font-medium">Cancha</th>
                            <th className="px-4 py-3 font-medium">Fecha</th>
                            <th className="px-4 py-3 font-medium">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservationStats.latest.map((reservation, index) => (
                            <tr
                              key={reservation.id}
                              className={cn(
                                'border-b border-border/60 border-l-4 transition-colors duration-200 last:border-b-0 hover:bg-primary-50/50',
                                statusBorderMap[reservation.estado],
                                'animate-fade-in-up opacity-0',
                              )}
                              style={{ animationDelay: `${480 + index * 50}ms` }}
                            >
                              <td className="px-4 py-3.5 font-semibold text-primary-800">
                                {reservation.codigo}
                              </td>
                              <td className="px-4 py-3.5 text-text">
                                {reservation.user.nombre} {reservation.user.apellido}
                              </td>
                              <td className="px-4 py-3.5 text-text-muted">
                                {reservation.court.nombre}
                              </td>
                              <td className="px-4 py-3.5 text-text-muted">
                                {formatDateTime(reservation.fechaInicio)}
                              </td>
                              <td className="px-4 py-3.5">
                                <Badge variant={reservationBadgeVariant(reservation.estado)}>
                                  {getReservationStatusLabel(reservation.estado)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </QueryState>
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
