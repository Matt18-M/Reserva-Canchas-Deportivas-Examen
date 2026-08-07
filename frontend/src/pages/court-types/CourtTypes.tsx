import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import CourtTypeForm from '@/pages/court-types/CourtTypeForm';
import CourtTypeTable from '@/pages/court-types/CourtTypeTable';
import type { CourtTypeFormValues } from '@/pages/court-types/court-type.schema';
import ConfirmDialog from '@/pages/users/ConfirmDialog';
import courtTypesService, { type CourtType } from '@/services/court-types.service';

type FormMode = 'create' | 'edit' | null;

const CourtTypes = () => {
  const queryClient = useQueryClient();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingCourtType, setEditingCourtType] = useState<CourtType | null>(null);
  const [deletingCourtType, setDeletingCourtType] = useState<CourtType | null>(null);

  const courtTypesQuery = useQuery({
    queryKey: ['court-types'],
    queryFn: courtTypesService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CourtTypeFormValues) =>
      courtTypesService.create({
        nombre: payload.nombre,
        descripcion: payload.descripcion?.trim()
          ? payload.descripcion.trim()
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-types'] });
      toast.success('Tipo de cancha creado correctamente.');
      closeForm();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo crear el tipo de cancha.'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CourtTypeFormValues }) =>
      courtTypesService.update(id, {
        nombre: payload.nombre,
        descripcion: payload.descripcion?.trim()
          ? payload.descripcion.trim()
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-types'] });
      toast.success('Tipo de cancha actualizado correctamente.');
      closeForm();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el tipo de cancha.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => courtTypesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-types'] });
      toast.success('Tipo de cancha eliminado correctamente.');
      setDeletingCourtType(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar el tipo de cancha.'));
    },
  });

  const closeForm = () => {
    setFormMode(null);
    setEditingCourtType(null);
  };

  const openCreateForm = () => {
    setEditingCourtType(null);
    setFormMode('create');
  };

  const openEditForm = (courtType: CourtType) => {
    setEditingCourtType(courtType);
    setFormMode('edit');
  };

  const handleFormSubmit = (values: CourtTypeFormValues) => {
    if (formMode === 'create') {
      createMutation.mutate(values);
      return;
    }

    if (formMode === 'edit' && editingCourtType) {
      updateMutation.mutate({
        id: editingCourtType.id,
        payload: values,
      });
    }
  };

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Tipos de cancha"
        description="Administra las categorías disponibles para clasificar las canchas."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreateForm}>
            Nuevo tipo
          </Button>
        }
      />

      {courtTypesQuery.isLoading ? (
        <Loading fullScreen label="Cargando tipos de cancha..." />
      ) : null}

      {courtTypesQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(
            courtTypesQuery.error,
            'No se pudieron cargar los tipos de cancha.',
          )}
        </div>
      ) : null}

      {courtTypesQuery.isSuccess ? (
        <CourtTypeTable
          courtTypes={courtTypesQuery.data}
          onEdit={openEditForm}
          onDelete={setDeletingCourtType}
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
          <Card className="relative z-10 w-full max-w-xl shadow-lg">
            <CourtTypeForm
              mode={formMode}
              courtType={editingCourtType}
              isSubmitting={isFormSubmitting}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
            />
          </Card>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deletingCourtType)}
        title="Eliminar tipo de cancha"
        description={
          deletingCourtType
            ? `¿Deseas eliminar el tipo "${deletingCourtType.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingCourtType) {
            deleteMutation.mutate(deletingCourtType.id);
          }
        }}
        onCancel={() => setDeletingCourtType(null)}
      />
    </div>
  );
};

export default CourtTypes;
