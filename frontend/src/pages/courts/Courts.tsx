import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import CourtForm from '@/pages/courts/CourtForm';
import CourtTable from '@/pages/courts/CourtTable';
import type { CourtFormValues } from '@/pages/courts/court.schema';
import ConfirmDialog from '@/pages/users/ConfirmDialog';
import courtTypesService from '@/services/court-types.service';
import courtsService, { type Court } from '@/services/courts.service';

type FormMode = 'create' | 'edit' | null;

type ConfirmAction =
  | { type: 'delete'; court: Court }
  | { type: 'status'; court: Court }
  | null;

const buildCourtPayload = (values: CourtFormValues) => ({
  nombre: values.nombre.trim(),
  descripcion: values.descripcion?.trim() ? values.descripcion.trim() : undefined,
  precioHora: values.precioHora,
  capacidad: values.capacidad,
  ubicacion: values.ubicacion?.trim() ? values.ubicacion.trim() : undefined,
  imagen: values.imagen?.trim() ? values.imagen.trim() : undefined,
  tipoCanchaId: values.tipoCanchaId,
});

const Courts = () => {
  const queryClient = useQueryClient();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const courtsQuery = useQuery({
    queryKey: ['courts', 'admin'],
    queryFn: courtsService.getAllAdmin,
  });

  const courtTypesQuery = useQuery({
    queryKey: ['court-types'],
    queryFn: courtTypesService.getAll,
  });

  const invalidateCourts = async () => {
    await queryClient.invalidateQueries({ queryKey: ['courts'] });
    await queryClient.invalidateQueries({ queryKey: ['courts', 'admin'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard', 'courts'] });
  };

  const createMutation = useMutation({
    mutationFn: async (values: CourtFormValues) => {
      const court = await courtsService.create(buildCourtPayload(values));

      if (!values.activa) {
        return courtsService.updateStatus(court.id, false);
      }

      return court;
    },
    onSuccess: async () => {
      await invalidateCourts();
      toast.success('Cancha creada correctamente.');
      closeForm();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo crear la cancha.'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
      previousActive,
    }: {
      id: number;
      values: CourtFormValues;
      previousActive: boolean;
    }) => {
      const court = await courtsService.update(id, buildCourtPayload(values));

      if (values.activa !== previousActive) {
        return courtsService.updateStatus(id, values.activa);
      }

      return court;
    },
    onSuccess: async () => {
      await invalidateCourts();
      toast.success('Cancha actualizada correctamente.');
      closeForm();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar la cancha.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => courtsService.delete(id),
    onSuccess: async () => {
      await invalidateCourts();
      toast.success('Cancha eliminada correctamente.');
      setConfirmAction(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar la cancha.'));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, activa }: { id: number; activa: boolean }) =>
      courtsService.updateStatus(id, activa),
    onSuccess: async (_data, variables) => {
      await invalidateCourts();
      toast.success(
        variables.activa
          ? 'Cancha activada correctamente.'
          : 'Cancha desactivada correctamente.',
      );
      setConfirmAction(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el estado.'));
    },
  });

  const closeForm = () => {
    setFormMode(null);
    setEditingCourt(null);
  };

  const openCreateForm = () => {
    setEditingCourt(null);
    setFormMode('create');
  };

  const openEditForm = (court: Court) => {
    setEditingCourt(court);
    setFormMode('edit');
  };

  const handleFormSubmit = (values: CourtFormValues) => {
    if (formMode === 'create') {
      createMutation.mutate(values);
      return;
    }

    if (formMode === 'edit' && editingCourt) {
      updateMutation.mutate({
        id: editingCourt.id,
        values,
        previousActive: editingCourt.activa,
      });
    }
  };

  const handleConfirm = () => {
    if (!confirmAction) {
      return;
    }

    if (confirmAction.type === 'delete') {
      deleteMutation.mutate(confirmAction.court.id);
      return;
    }

    statusMutation.mutate({
      id: confirmAction.court.id,
      activa: !confirmAction.court.activa,
    });
  };

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;
  const isConfirmLoading = deleteMutation.isPending || statusMutation.isPending;

  const confirmDialogProps =
    confirmAction?.type === 'delete'
      ? {
          title: 'Eliminar cancha',
          description: `¿Deseas eliminar la cancha "${confirmAction.court.nombre}"? Esta acción no se puede deshacer.`,
          confirmLabel: 'Eliminar',
          variant: 'danger' as const,
        }
      : confirmAction?.type === 'status'
        ? {
            title: confirmAction.court.activa ? 'Desactivar cancha' : 'Activar cancha',
            description: confirmAction.court.activa
              ? `¿Deseas desactivar la cancha "${confirmAction.court.nombre}"?`
              : `¿Deseas activar la cancha "${confirmAction.court.nombre}"?`,
            confirmLabel: confirmAction.court.activa ? 'Desactivar' : 'Activar',
            variant: (confirmAction.court.activa ? 'danger' : 'primary') as
              | 'danger'
              | 'primary',
          }
        : null;

  return (
    <div>
      <PageHeader
        title="Canchas"
        description="Administra las canchas deportivas registradas en el sistema."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreateForm}>
            Nueva cancha
          </Button>
        }
      />

      {courtsQuery.isLoading ? (
        <Loading fullScreen label="Cargando canchas..." />
      ) : null}

      {courtsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(courtsQuery.error, 'No se pudieron cargar las canchas.')}
        </div>
      ) : null}

      {courtsQuery.isSuccess ? (
        <CourtTable
          courts={courtsQuery.data}
          onEdit={openEditForm}
          onDelete={(court) => setConfirmAction({ type: 'delete', court })}
          onToggleStatus={(court) => setConfirmAction({ type: 'status', court })}
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
            <CourtForm
              mode={formMode}
              court={editingCourt}
              courtTypes={courtTypesQuery.data ?? []}
              isLoadingCourtTypes={courtTypesQuery.isLoading}
              isCourtTypesError={courtTypesQuery.isError}
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

export default Courts;
