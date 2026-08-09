import { Filter, RotateCcw } from 'lucide-react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { AdminReservation, ReservationStatus } from '@/services/admin-reservations.service';
import type { AuthUser } from '@/modules/auth/types';
import type { CourtSummary } from '@/services/schedules.service';
import { cn } from '@/utils/cn';

export type AdminReservationFiltersState = {
  estado: string;
  usuarioId: string;
  canchaId: string;
  date: string;
};

export const EMPTY_ADMIN_RESERVATION_FILTERS: AdminReservationFiltersState = {
  estado: '',
  usuarioId: '',
  canchaId: '',
  date: '',
};

export const ACTIVE_RESERVATION_STATUS_OPTIONS: {
  value: ReservationStatus;
  label: string;
}[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

export const RESERVATION_STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  ...ACTIVE_RESERVATION_STATUS_OPTIONS,
  { value: 'COMPLETADA', label: 'Completada' },
];

export const getReservationStatusLabel = (status: ReservationStatus): string =>
  RESERVATION_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

export const filterAdminReservations = (
  reservations: AdminReservation[],
  filters: AdminReservationFiltersState,
): AdminReservation[] =>
  reservations.filter((reservation) => {
    if (filters.estado && reservation.estado !== filters.estado) {
      return false;
    }

    if (filters.usuarioId && reservation.usuarioId !== Number(filters.usuarioId)) {
      return false;
    }

    if (filters.canchaId && reservation.canchaId !== Number(filters.canchaId)) {
      return false;
    }

    if (filters.date) {
      const reservationDate = reservation.fechaInicio.slice(0, 10);
      if (reservationDate !== filters.date) {
        return false;
      }
    }

    return true;
  });

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
  'transition-all duration-200',
  'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
  'hover:border-primary-300',
);

type ReservationFiltersProps = {
  filters: AdminReservationFiltersState;
  users: AuthUser[];
  courts: CourtSummary[];
  variant?: 'active' | 'history';
  onChange: (filters: AdminReservationFiltersState) => void;
};

const ReservationFilters = ({
  filters,
  users,
  courts,
  variant = 'active',
  onChange,
}: ReservationFiltersProps) => {
  const statusOptions =
    variant === 'history' ? RESERVATION_STATUS_OPTIONS : ACTIVE_RESERVATION_STATUS_OPTIONS;

  const hasActiveFilters = Object.values(filters).some((value) => value.length > 0);

  const handleReset = () => {
    onChange(EMPTY_ADMIN_RESERVATION_FILTERS);
  };

  return (
    <Card className="overflow-hidden border-primary-200/70 bg-gradient-to-br from-primary-50/70 via-surface to-secondary-50/40 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="border-b border-primary-100/80 bg-white/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-primary-800">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
              <Filter className="size-4" />
            </span>
            Filtros
          </CardTitle>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="size-3.5" />}
              onClick={handleReset}
              className="border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="admin-status-filter" className="text-sm font-medium text-text">
              Estado
            </label>
            <select
              id="admin-status-filter"
              value={filters.estado}
              onChange={(event) => onChange({ ...filters, estado: event.target.value })}
              className={selectClassName}
            >
              <option value="">Todos los estados</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-user-filter" className="text-sm font-medium text-text">
              Usuario
            </label>
            <select
              id="admin-user-filter"
              value={filters.usuarioId}
              onChange={(event) => onChange({ ...filters, usuarioId: event.target.value })}
              className={selectClassName}
            >
              <option value="">Todos los usuarios</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} {user.apellido}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-court-filter" className="text-sm font-medium text-text">
              Cancha
            </label>
            <select
              id="admin-court-filter"
              value={filters.canchaId}
              onChange={(event) => onChange({ ...filters, canchaId: event.target.value })}
              className={selectClassName}
            >
              <option value="">Todas las canchas</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.codigo} — {court.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-date-filter" className="text-sm font-medium text-text">
              Fecha
            </label>
            <input
              id="admin-date-filter"
              type="date"
              value={filters.date}
              onChange={(event) => onChange({ ...filters, date: event.target.value })}
              className={selectClassName}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationFilters;
