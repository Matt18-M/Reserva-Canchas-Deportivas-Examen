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
import type { CourtTypeFormValues } from '@/pages/court-types/court-type.schema';
import { courtTypeFormSchema } from '@/pages/court-types/court-type.schema';
import type { CourtType } from '@/services/court-types.service';
import { cn } from '@/utils/cn';

type CourtTypeFormProps = {
  mode: 'create' | 'edit';
  courtType?: CourtType | null;
  isSubmitting?: boolean;
  onSubmit: (values: CourtTypeFormValues) => void;
  onCancel: () => void;
};

const CourtTypeForm = ({
  mode,
  courtType,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: CourtTypeFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourtTypeFormValues>({
    resolver: zodResolver(courtTypeFormSchema),
    defaultValues: {
      nombre: courtType?.nombre ?? '',
      descripcion: courtType?.descripcion ?? '',
    },
  });

  useEffect(() => {
    reset({
      nombre: courtType?.nombre ?? '',
      descripcion: courtType?.descripcion ?? '',
    });
  }, [courtType, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Nuevo tipo de cancha' : 'Editar tipo de cancha'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Registra un nuevo tipo de cancha deportiva.'
            : `Actualiza la información de ${courtType?.nombre ?? 'el tipo seleccionado'}.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
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
            placeholder="Ej. Fútbol 11"
            {...register('nombre')}
          />
          {errors.nombre ? (
            <p className="text-xs text-danger">{errors.nombre.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="descripcion" className="text-sm font-medium text-text">
            Descripción
          </label>
          <textarea
            id="descripcion"
            rows={4}
            className={cn(
              'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text',
              'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              errors.descripcion ? 'border-danger' : 'border-border',
            )}
            placeholder="Descripción opcional del tipo de cancha"
            {...register('descripcion')}
          />
          {errors.descripcion ? (
            <p className="text-xs text-danger">{errors.descripcion.message}</p>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Crear tipo' : 'Guardar cambios'}
        </Button>
      </CardFooter>
    </form>
  );
};

export default CourtTypeForm;
