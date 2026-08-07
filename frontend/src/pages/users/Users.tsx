import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import PageHeader from '@/components/ui/PageHeader';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import type { AuthUser } from '@/modules/auth/types';
import ConfirmDialog from '@/pages/users/ConfirmDialog';
import UserForm from '@/pages/users/UserForm';
import UserTable from '@/pages/users/UserTable';
import type { UserFormValues } from '@/pages/users/user.schema';
import usersService from '@/services/users.service';

const Users = () => {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [statusUser, setStatusUser] = useState<AuthUser | null>(null);

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserFormValues }) =>
      usersService.update(id, {
        nombre: payload.nombre,
        apellido: payload.apellido,
        telefono: payload.telefono?.trim() ? payload.telefono.trim() : undefined,
        fotoPerfil: payload.fotoPerfil?.trim() ? payload.fotoPerfil.trim() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'users'] });
      toast.success('Usuario actualizado correctamente.');
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el usuario.'));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      usersService.updateStatus(id, { activo }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'users'] });
      toast.success(
        variables.activo
          ? 'Usuario activado correctamente.'
          : 'Usuario desactivado correctamente.',
      );
      setStatusUser(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el estado.'));
    },
  });

  const handleEditSubmit = (values: UserFormValues) => {
    if (!editingUser) {
      return;
    }

    updateUserMutation.mutate({
      id: editingUser.id,
      payload: values,
    });
  };

  const handleConfirmStatus = () => {
    if (!statusUser) {
      return;
    }

    updateStatusMutation.mutate({
      id: statusUser.id,
      activo: !statusUser.activo,
    });
  };

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Administra los usuarios registrados en el sistema."
      />

      {usersQuery.isLoading ? (
        <Loading fullScreen label="Cargando usuarios..." />
      ) : null}

      {usersQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(usersQuery.error, 'No se pudieron cargar los usuarios.')}
        </div>
      ) : null}

      {usersQuery.isSuccess ? (
        <UserTable
          users={usersQuery.data}
          onEdit={setEditingUser}
          onToggleStatus={setStatusUser}
        />
      ) : null}

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-text/30 backdrop-blur-sm"
            aria-label="Cerrar modal"
            onClick={() => setEditingUser(null)}
          />
          <Card className="relative z-10 w-full max-w-2xl shadow-lg">
            <UserForm
              user={editingUser}
              isSubmitting={updateUserMutation.isPending}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingUser(null)}
            />
          </Card>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(statusUser)}
        title={statusUser?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        description={
          statusUser
            ? statusUser.activo
              ? `¿Deseas desactivar a ${statusUser.nombre} ${statusUser.apellido}?`
              : `¿Deseas activar a ${statusUser.nombre} ${statusUser.apellido}?`
            : ''
        }
        confirmLabel={statusUser?.activo ? 'Desactivar' : 'Activar'}
        variant={statusUser?.activo ? 'danger' : 'primary'}
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleConfirmStatus}
        onCancel={() => setStatusUser(null)}
      />
    </div>
  );
};

export default Users;
