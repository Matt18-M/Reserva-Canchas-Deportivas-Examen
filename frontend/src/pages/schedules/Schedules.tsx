import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import ScheduleForm from '@/pages/schedules/ScheduleForm';
import ScheduleTable from '@/pages/schedules/ScheduleTable';
import type { ScheduleFormValues } from '@/pages/schedules/schedule.schema';
import ConfirmDialog from '@/pages/users/ConfirmDialog';
import schedulesService, { type ScheduleWithCourt } from '@/services/schedules.service';

type FormMode = 'create' | 'edit' | null;

type ConfirmAction =
  | { type: 'delete'; schedule: ScheduleWithCourt }
  | { type: 'status'; schedule: ScheduleWithCourt }
  | null;

const buildSchedulePayload = (values: ScheduleFormValues) => ({
  canchaId: values.canchaId,
  diaSemana: values.diaSemana,
  horaInicio: values.horaInicio,
  horaFin: values.horaFin,
});

const Schedules = () => {
  const queryClient = useQueryClient();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleWithCourt | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const courtsQuery = useQuery({
    queryKey: ['courts', 'admin'],
    queryFn: schedulesService.getAdminCourts,
  });

  const scheduleQueries = useQueries({
    queries: (courtsQuery.data ?? []).map((court) => ({
      queryKey: ['schedules', 'court', court.id],
      queryFn: () => schedulesService.getByCourt(court.id),
      enabled: courtsQuery.isSuccess,
    })),
  });

  const schedules = useMemo<ScheduleWithCourt[]>(() => {
    if (!courtsQuery.data) {
      return [];
    }

    return courtsQuery.data.flatMap((court, index) => {
      const courtSchedules = scheduleQueries[index]?.data ?? [];

      return courtSchedules.map((schedule) => ({
        ...schedule,
        court: {
          id: court.id,
          codigo: court.codigo,
          nombre: court.nombre,
          activa: court.activa,
        },
      }));
    });
  }, [courtsQuery.data, scheduleQueries]);

  const invalidateSchedules = async (courtId?: number) => {
    if (courtId !== undefined) {
      await queryClient.invalidateQueries({ queryKey: ['schedules', 'court', courtId] });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ['schedules'] });
  };

  const createMutation = useMutation({
    mutationFn: async (values: ScheduleFormValues) => {
      const schedule = await schedulesService.create(buildSchedulePayload(values));

      if (!values.activo) {
        return schedulesService.updateStatus(schedule.id, false);
      }

      return schedule;
    },
    onSuccess: async (_data, variables) => {
      await invalidateSchedules(variables.canchaId);
      toast.success('Horario creado correctamente.');
      closeForm();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo crear el horario.'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
      previousActive,
    }: {
      id: number;
      values: ScheduleFormValues;
      previousActive: boolean;
    }) => {
      const schedule = await schedulesService.update(id, buildSchedulePayload(values));

      if (values.activo !== previousActive) {
        return schedulesService.updateStatus(id, values.activo);
      }

      return schedule;
    },
    onSuccess: async (_data, variables) => {
      await invalidateSchedules(variables.values.canchaId);
      if (editingSchedule && editingSchedule.canchaId !== variables.values.canchaId) {
        await invalidateSchedules(editingSchedule.canchaId);
      }
      toast.success('Horario actualizado correctamente.');
      closeForm();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el horario.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (schedule: ScheduleWithCourt) => schedulesService.delete(schedule.id),
    onSuccess: async (_data, schedule) => {
      await invalidateSchedules(schedule.canchaId);
      toast.success('Horario eliminado correctamente.');
      setConfirmAction(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar el horario.'));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      schedulesService.updateStatus(id, activo),
    onSuccess: async (data, variables) => {
      await invalidateSchedules(data.canchaId);
      toast.success(
        variables.activo
          ? 'Horario activado correctamente.'
          : 'Horario desactivado correctamente.',
      );
      setConfirmAction(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el estado.'));
    },
  });

  const closeForm = () => {
    setFormMode(null);
    setEditingSchedule(null);
  };

  const openCreateForm = () => {
    setEditingSchedule(null);
    setFormMode('create');
  };

  const openEditForm = (schedule: ScheduleWithCourt) => {
    setEditingSchedule(schedule);
    setFormMode('edit');
  };

  const handleFormSubmit = (values: ScheduleFormValues) => {
    if (formMode === 'create') {
      createMutation.mutate(values);
      return;
    }

    if (formMode === 'edit' && editingSchedule) {
      updateMutation.mutate({
        id: editingSchedule.id,
        values,
        previousActive: editingSchedule.activo,
      });
    }
  };

  const handleConfirm = () => {
    if (!confirmAction) {
      return;
    }

    if (confirmAction.type === 'delete') {
      deleteMutation.mutate(confirmAction.schedule);
      return;
    }

    statusMutation.mutate({
      id: confirmAction.schedule.id,
      activo: !confirmAction.schedule.activo,
    });
  };

  const isLoadingSchedules =
    courtsQuery.isLoading || scheduleQueries.some((query) => query.isLoading);
  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;
  const isConfirmLoading = deleteMutation.isPending || statusMutation.isPending;

  const confirmDialogProps =
    confirmAction?.type === 'delete'
      ? {
          title: 'Eliminar horario',
          description: `¿Deseas eliminar el horario de ${confirmAction.schedule.court.nombre}? Esta acción no se puede deshacer.`,
          confirmLabel: 'Eliminar',
          variant: 'danger' as const,
        }
      : confirmAction?.type === 'status'
        ? {
            title: confirmAction.schedule.activo ? 'Desactivar horario' : 'Activar horario',
            description: confirmAction.schedule.activo
              ? `¿Deseas desactivar el horario de ${confirmAction.schedule.court.nombre}?`
              : `¿Deseas activar el horario de ${confirmAction.schedule.court.nombre}?`,
            confirmLabel: confirmAction.schedule.activo ? 'Desactivar' : 'Activar',
            variant: (confirmAction.schedule.activo ? 'danger' : 'primary') as
              | 'danger'
              | 'primary',
          }
        : null;

  const schedulesError =
    courtsQuery.error ??
    scheduleQueries.find((query) => query.error)?.error ??
    null;

  return (
    <div>
      <PageHeader
        title="Horarios"
        description="Administra los horarios de disponibilidad de las canchas."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreateForm}>
            Nuevo horario
          </Button>
        }
      />

      {isLoadingSchedules ? <Loading fullScreen label="Cargando horarios..." /> : null}

      {schedulesError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(schedulesError, 'No se pudieron cargar los horarios.')}
        </div>
      ) : null}

      {courtsQuery.isSuccess && !isLoadingSchedules ? (
        <ScheduleTable
          schedules={schedules}
          courts={courtsQuery.data}
          onEdit={openEditForm}
          onDelete={(schedule) => setConfirmAction({ type: 'delete', schedule })}
          onToggleStatus={(schedule) => setConfirmAction({ type: 'status', schedule })}
        />
      ) : null}

      {formMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-text/30 backdrop-blur-sm"
            aria-label="Cerrar modal"
            onClick={closeForm}
          />
          <Card className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto shadow-lg">
            <ScheduleForm
              mode={formMode}
              schedule={editingSchedule}
              courts={courtsQuery.data ?? []}
              isLoadingCourts={courtsQuery.isLoading}
              isSubmitting={isFormSubmitting}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
            />
          </Card>
        </div>
      ) : null}

      {confirmDialogProps ? (
        <ConfirmDialog
          open={Boolean(confirmAction)}
          title={confirmDialogProps.title}
          description={confirmDialogProps.description}
          confirmLabel={confirmDialogProps.confirmLabel}
          variant={confirmDialogProps.variant}
          isLoading={isConfirmLoading}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      ) : null}
    </div>
  );
};

export default Schedules;
