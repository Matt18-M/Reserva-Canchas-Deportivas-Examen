import { Search } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ReservationStatus } from '@/services/admin-reservations.service';
import type { AuthUser } from '@/modules/auth/types';
import type { CourtSummary } from '@/services/schedules.service';
import { cn } from '@/utils/cn';

export type AdminReservationFiltersState = {
  estado: string;
  usuarioId: string;
  canchaId: string;
  date: string;
  codeSearch: string;
  userSearch: string;
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

type ReservationFiltersProps = {
  filters: AdminReservationFiltersState;
  users: AuthUser[];
  courts: CourtSummary[];
  onChange: (filters: AdminReservationFiltersState) => void;
};

const ReservationFilters = ({
  filters,
  users,
  courts,
  onChange,
}: ReservationFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros y búsqueda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="admin-status-filter" className="text-sm font-medium text-text">
              Estado
            </label>
            <select
              id="admin-status-filter"
              value={filters.estado}
              onChange={(event) => onChange({ ...filters, estado: event.target.value })}
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            >
              <option value="">Todos los estados</option>
              {ACTIVE_RESERVATION_STATUS_OPTIONS.map((option) => (
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
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
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
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
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
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={filters.codeSearch}
              onChange={(event) => onChange({ ...filters, codeSearch: event.target.value })}
              placeholder="Buscar por código..."
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-text',
                'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            />
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={filters.userSearch}
              onChange={(event) => onChange({ ...filters, userSearch: event.target.value })}
              placeholder="Buscar por usuario..."
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-text',
                'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationFilters;
