import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/Button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import {
  DIA_SEMANA_OPTIONS,
  toTimeInputValue,
} from '@/pages/schedules/schedule.constants';
import { scheduleFormSchema, type ScheduleFormValues } from '@/pages/schedules/schedule.schema';
import type { CourtSummary, ScheduleWithCourt } from '@/services/schedules.service';
import { cn } from '@/utils/cn';

type ScheduleFormProps = {
  mode: 'create' | 'edit';
  schedule?: ScheduleWithCourt | null;
  courts: CourtSummary[];
  isLoadingCourts?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: ScheduleFormValues) => void;
  onCancel: () => void;
};

const ScheduleForm = ({
  mode,
  schedule,
  courts,
  isLoadingCourts = false,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ScheduleFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      canchaId: schedule?.canchaId ?? undefined,
      diaSemana: schedule?.diaSemana ?? undefined,
      horaInicio: schedule ? toTimeInputValue(schedule.horaInicio) : '',
      horaFin: schedule ? toTimeInputValue(schedule.horaFin) : '',
      activo: schedule?.activo ?? true,
    },
  });

  useEffect(() => {
    reset({
      canchaId: schedule?.canchaId ?? undefined,
      diaSemana: schedule?.diaSemana ?? undefined,
      horaInicio: schedule ? toTimeInputValue(schedule.horaInicio) : '',
      horaFin: schedule ? toTimeInputValue(schedule.horaFin) : '',
      activo: schedule?.activo ?? true,
    });
  }, [schedule, reset]);

  if (isLoadingCourts) {
    return <Loading label="Cargando canchas..." className="py-10" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Nuevo horario' : 'Editar horario'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Registra un nuevo horario de disponibilidad para una cancha.'
            : 'Actualiza la información del horario seleccionado.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="canchaId" className="text-sm font-medium text-text">
              Cancha
            </label>
            <select
              id="canchaId"
              className={cn(
                'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                errors.canchaId ? 'border-danger' : 'border-border',
              )}
              {...register('canchaId', { valueAsNumber: true })}
            >
              <option value="">Seleccionar cancha</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id} disabled={!court.activa}>
                  {court.codigo} — {court.nombre}
                  {!court.activa ? ' (Inactiva)' : ''}
                </option>
              ))}
            </select>
            {errors.canchaId ? (
              <p className="text-xs text-danger">{errors.canchaId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="diaSemana" className="text-sm font-medium text-text">
              Día de la semana
            </label>
            <select
              id="diaSemana"
              className={cn(
                'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                errors.diaSemana ? 'border-danger' : 'border-border',
              )}
              {...register('diaSemana')}
            >
              <option value="">Seleccionar día</option>
              {DIA_SEMANA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.diaSemana ? (
              <p className="text-xs text-danger">{errors.diaSemana.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="horaInicio" className="text-sm font-medium text-text">
              Hora inicio
            </label>
            <input
              id="horaInicio"
              type="time"
              className={cn(
                'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                errors.horaInicio ? 'border-danger' : 'border-border',
              )}
              {...register('horaInicio')}
            />
            {errors.horaInicio ? (
              <p className="text-xs text-danger">{errors.horaInicio.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="horaFin" className="text-sm font-medium text-text">
              Hora fin
            </label>
            <input
              id="horaFin"
              type="time"
              className={cn(
                'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                errors.horaFin ? 'border-danger' : 'border-border',
              )}
              {...register('horaFin')}
            />
            {errors.horaFin ? (
              <p className="text-xs text-danger">{errors.horaFin.message}</p>
            ) : null}
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3">
          <input
            type="checkbox"
            className="size-4 rounded border-border text-primary-600 focus:ring-primary-500"
            {...register('activo')}
          />
          <span className="text-sm font-medium text-text">Horario activo</span>
        </label>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Crear horario' : 'Guardar cambios'}
        </Button>
      </CardFooter>
    </form>
  );
};

export default ScheduleForm;
