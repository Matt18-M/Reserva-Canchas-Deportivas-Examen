import { Pencil, Power, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ScheduleFilters, {
  EMPTY_SCHEDULE_FILTERS,
  type ScheduleFiltersState,
} from '@/pages/schedules/ScheduleFilters';
import {
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
  const [filters, setFilters] = useState<ScheduleFiltersState>(EMPTY_SCHEDULE_FILTERS);

  const filteredSchedules = useMemo(() => {
    const courtId = filters.courtId ? Number(filters.courtId) : null;
    const day = filters.diaSemana || null;
    const status =
      filters.estado === 'true' ? true : filters.estado === 'false' ? false : null;

    return schedules.filter((schedule) => {
      const matchesCourt = courtId === null || schedule.canchaId === courtId;
      const matchesDay = day === null || schedule.diaSemana === day;
      const matchesStatus = status === null || schedule.activo === status;

      return matchesCourt && matchesDay && matchesStatus;
    });
  }, [schedules, filters]);

  return (
    <div className="space-y-4">
      <ScheduleFilters filters={filters} courts={courts} onChange={setFilters} />

      <Card className="overflow-hidden border-border/80 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-surface via-primary-50/30 to-secondary-50/30">
          <CardTitle>Horarios ({filteredSchedules.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/80 text-text-muted">
                  <th className="px-4 py-3 font-medium">Cancha</th>
                  <th className="px-4 py-3 font-medium">Día</th>
                  <th className="px-4 py-3 font-medium">Hora inicio</th>
                  <th className="px-4 py-3 font-medium">Hora fin</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-text-muted">
                      No se encontraron horarios con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((schedule, index) => (
                    <tr
                      key={schedule.id}
                      className={cn(
                        'border-b border-border/60 border-l-4 transition-all duration-200 last:border-b-0',
                        schedule.activo
                          ? 'border-l-emerald-500 hover:bg-emerald-50/60'
                          : 'border-l-red-400 hover:bg-red-50/50',
                        'animate-fade-in-up opacity-0',
                      )}
                      style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}
                    >
                      <td className="px-4 py-3.5 font-medium text-text">
                        {schedule.court.codigo} — {schedule.court.nombre}
                        {!schedule.court.activa ? (
                          <span className="ml-2 text-xs text-text-muted">(Cancha inactiva)</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {getDiaSemanaLabel(schedule.diaSemana)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-primary-800">
                        {formatScheduleTime(schedule.horaInicio)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-primary-800">
                        {formatScheduleTime(schedule.horaFin)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={schedule.activo ? 'success' : 'danger'}>
                          {schedule.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Pencil className="size-4" />}
                            onClick={() => onEdit(schedule)}
                            className="transition-transform duration-200 hover:scale-[1.02]"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Power className="size-4" />}
                            onClick={() => onToggleStatus(schedule)}
                            className={cn(
                              'transition-colors duration-200',
                              schedule.activo
                                ? 'hover:bg-amber-50 hover:text-amber-700'
                                : 'hover:bg-emerald-50 hover:text-emerald-700',
                            )}
                          >
                            {schedule.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger transition-colors duration-200 hover:bg-red-50 hover:text-danger"
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
    </div>
  );
};

export default ScheduleTable;
