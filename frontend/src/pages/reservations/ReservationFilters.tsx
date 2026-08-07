import { Search } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ReservationStatus } from '@/services/reservations.service';
import { cn } from '@/utils/cn';

export type ReservationFiltersState = {
  status: string;
  date: string;
  code: string;
};

type ReservationFiltersProps = {
  filters: ReservationFiltersState;
  onChange: (filters: ReservationFiltersState) => void;
};

export const RESERVATION_STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'COMPLETADA', label: 'Completada' },
];

const ReservationFilters = ({ filters, onChange }: ReservationFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-text">
              Estado
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(event) =>
                onChange({ ...filters, status: event.target.value })
              }
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            >
              <option value="">Todos los estados</option>
              {RESERVATION_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="date-filter" className="text-sm font-medium text-text">
              Fecha
            </label>
            <input
              id="date-filter"
              type="date"
              value={filters.date}
              onChange={(event) => onChange({ ...filters, date: event.target.value })}
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="code-search" className="text-sm font-medium text-text">
              Buscar por código
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
              <input
                id="code-search"
                type="search"
                value={filters.code}
                onChange={(event) => onChange({ ...filters, code: event.target.value })}
                placeholder="RES-..."
                className={cn(
                  'h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-text',
                  'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationFilters;
