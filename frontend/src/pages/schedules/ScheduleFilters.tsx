import { Filter, RotateCcw } from 'lucide-react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DIA_SEMANA_OPTIONS } from '@/pages/schedules/schedule.constants';
import type { CourtSummary } from '@/services/schedules.service';
import { cn } from '@/utils/cn';

export type ScheduleFiltersState = {
  courtId: string;
  diaSemana: string;
  estado: string;
};

export const EMPTY_SCHEDULE_FILTERS: ScheduleFiltersState = {
  courtId: '',
  diaSemana: '',
  estado: '',
};

export const SCHEDULE_STATUS_OPTIONS = [
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
] as const;

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
  'transition-all duration-200',
  'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
  'hover:border-primary-300',
);

type ScheduleFiltersProps = {
  filters: ScheduleFiltersState;
  courts: CourtSummary[];
  onChange: (filters: ScheduleFiltersState) => void;
};

const ScheduleFilters = ({ filters, courts, onChange }: ScheduleFiltersProps) => {
  const hasActiveFilters = Object.values(filters).some((value) => value.length > 0);

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
              onClick={() => onChange(EMPTY_SCHEDULE_FILTERS)}
              className="border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="court-filter" className="text-sm font-medium text-text">
              Cancha
            </label>
            <select
              id="court-filter"
              value={filters.courtId}
              onChange={(event) => onChange({ ...filters, courtId: event.target.value })}
              className={selectClassName}
            >
              <option value="">Todas las canchas</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.codigo} — {court.nombre}
                  {!court.activa ? ' (Inactiva)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="day-filter" className="text-sm font-medium text-text">
              Día
            </label>
            <select
              id="day-filter"
              value={filters.diaSemana}
              onChange={(event) => onChange({ ...filters, diaSemana: event.target.value })}
              className={selectClassName}
            >
              <option value="">Todos los días</option>
              {DIA_SEMANA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-text">
              Estado
            </label>
            <select
              id="status-filter"
              value={filters.estado}
              onChange={(event) => onChange({ ...filters, estado: event.target.value })}
              className={selectClassName}
            >
              <option value="">Todos los estados</option>
              {SCHEDULE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleFilters;
