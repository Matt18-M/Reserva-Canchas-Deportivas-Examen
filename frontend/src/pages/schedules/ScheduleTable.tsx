import { Pencil, Power, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  DIA_SEMANA_OPTIONS,
  formatScheduleTime,
  getDiaSemanaLabel,
} from '@/pages/schedules/schedule.constants';
import type { CourtSummary, ScheduleWithCourt } from '@/services/schedules.service';
import { cn } from '@/utils/cn';

type ScheduleTableProps = {
  schedules: ScheduleWithCourt[];
  courts: CourtSummary[];
  onEdit: (schedule: ScheduleWithCourt) => void;
  onDelete: (schedule: ScheduleWithCourt) => void;
  onToggleStatus: (schedule: ScheduleWithCourt) => void;
};

const ScheduleTable = ({
  schedules,
  courts,
  onEdit,
  onDelete,
  onToggleStatus,
}: ScheduleTableProps) => {
  const [courtFilter, setCourtFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  const filteredSchedules = useMemo(() => {
    const courtId = courtFilter ? Number(courtFilter) : null;
    const day = dayFilter || null;

    return schedules.filter((schedule) => {
      const matchesCourt = courtId === null || schedule.canchaId === courtId;
      const matchesDay = day === null || schedule.diaSemana === day;

      return matchesCourt && matchesDay;
    });
  }, [schedules, courtFilter, dayFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de horarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="court-filter" className="text-sm font-medium text-text">
              Filtrar por cancha
            </label>
            <select
              id="court-filter"
              value={courtFilter}
              onChange={(event) => setCourtFilter(event.target.value)}
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
            <label htmlFor="day-filter" className="text-sm font-medium text-text">
              Filtrar por día
            </label>
            <select
              id="day-filter"
              value={dayFilter}
              onChange={(event) => setDayFilter(event.target.value)}
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            >
              <option value="">Todos los días</option>
              {DIA_SEMANA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-3 py-3 font-medium">Cancha</th>
                <th className="px-3 py-3 font-medium">Día</th>
                <th className="px-3 py-3 font-medium">Hora inicio</th>
                <th className="px-3 py-3 font-medium">Hora fin</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-text-muted">
                    No se encontraron horarios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    <td className="px-3 py-3 font-medium text-text">
                      {schedule.court.codigo} — {schedule.court.nombre}
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {getDiaSemanaLabel(schedule.diaSemana)}
                    </td>
                    <td className="px-3 py-3 text-text">
                      {formatScheduleTime(schedule.horaInicio)}
                    </td>
                    <td className="px-3 py-3 text-text">
                      {formatScheduleTime(schedule.horaFin)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={schedule.activo ? 'success' : 'danger'}>
                        {schedule.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Pencil className="size-4" />}
                          onClick={() => onEdit(schedule)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Power className="size-4" />}
                          onClick={() => onToggleStatus(schedule)}
                        >
                          {schedule.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-red-50 hover:text-danger"
                          leftIcon={<Trash2 className="size-4" />}
                          onClick={() => onDelete(schedule)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleTable;
