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
import type { AuthUser } from '@/modules/auth/types';
import { cn } from '@/utils/cn';
import { userFormSchema, type UserFormValues } from '@/pages/users/user.schema';

type UserFormProps = {
  user: AuthUser;
  isSubmitting?: boolean;
  onSubmit: (values: UserFormValues) => void;
  onCancel: () => void;
};

const UserForm = ({
  user,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: UserFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono ?? '',
      fotoPerfil: user.fotoPerfil ?? '',
    },
  });

  useEffect(() => {
    reset({
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono ?? '',
      fotoPerfil: user.fotoPerfil ?? '',
    });
  }, [user, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardHeader>
        <CardTitle>Editar usuario</CardTitle>
        <CardDescription>
          Actualiza la información de {user.nombre} {user.apellido}.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm">
          <p className="font-medium text-text">{user.email}</p>
          <p className="mt-1 text-text-muted">El correo no puede modificarse.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-medium text-text">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              className={cn(
                'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                errors.nombre ? 'border-danger' : 'border-border',
              )}
              {...register('nombre')}
            />
            {errors.nombre ? (
              <p className="text-xs text-danger">{errors.nombre.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="apellido" className="text-sm font-medium text-text">
              Apellido
            </label>
            <input
              id="apellido"
              type="text"
              className={cn(
                'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                errors.apellido ? 'border-danger' : 'border-border',
              )}
              {...register('apellido')}
            />
            {errors.apellido ? (
              <p className="text-xs text-danger">{errors.apellido.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="telefono" className="text-sm font-medium text-text">
            Teléfono
          </label>
          <input
            id="telefono"
            type="tel"
            className={cn(
              'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
              'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
            )}
            placeholder="+593 99 999 9999"
            {...register('telefono')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="fotoPerfil" className="text-sm font-medium text-text">
            Foto (URL)
          </label>
          <input
            id="fotoPerfil"
            type="url"
            className={cn(
              'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
              'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              errors.fotoPerfil ? 'border-danger' : 'border-border',
            )}
            placeholder="https://ejemplo.com/foto.jpg"
            {...register('fotoPerfil')}
          />
          {errors.fotoPerfil ? (
            <p className="text-xs text-danger">{errors.fotoPerfil.message}</p>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Guardar cambios
        </Button>
      </CardFooter>
    </form>
  );
};

export default UserForm;
