import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import type { CourtType } from '@/services/court-types.service';
import type { Court } from '@/services/courts.service';
import { cn } from '@/utils/cn';
import { courtFormSchema, type CourtFormValues } from '@/pages/courts/court.schema';

type CourtFormProps = {
  mode: 'create' | 'edit';
  court?: Court | null;
  courtTypes: CourtType[];
  isLoadingCourtTypes?: boolean;
  isCourtTypesError?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: CourtFormValues) => void;
  onCancel: () => void;
};

const CourtForm = ({
  mode,
  court,
  courtTypes,
  isLoadingCourtTypes = false,
  isCourtTypesError = false,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: CourtFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourtFormValues>({
    resolver: zodResolver(courtFormSchema),
    defaultValues: {
      nombre: court?.nombre ?? '',
      descripcion: court?.descripcion ?? '',
      precioHora: court ? Number(court.precioHora) : undefined,
      capacidad: court?.capacidad ?? undefined,
      ubicacion: court?.ubicacion ?? '',
      imagen: court?.imagen ?? '',
      tipoCanchaId: court?.tipoCanchaId ?? undefined,
      activa: court?.activa ?? true,
    },
  });

  useEffect(() => {
    reset({
      nombre: court?.nombre ?? '',
      descripcion: court?.descripcion ?? '',
      precioHora: court ? Number(court.precioHora) : undefined,
      capacidad: court?.capacidad ?? undefined,
      ubicacion: court?.ubicacion ?? '',
      imagen: court?.imagen ?? '',
      tipoCanchaId: court?.tipoCanchaId ?? undefined,
      activa: court?.activa ?? true,
    });
  }, [court, reset]);

  if (isLoadingCourtTypes) {
    return <Loading label="Cargando tipos de cancha..." className="py-10" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Nueva cancha' : 'Editar cancha'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Registra una nueva cancha deportiva. El código se generará automáticamente.'
            : `Actualiza la información de ${court?.nombre ?? 'la cancha seleccionada'}. Código: ${court?.codigo ?? '—'}.`}
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
            placeholder="Cancha principal"
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
            rows={3}
            className={cn(
              'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text',
              'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              errors.descripcion ? 'border-danger' : 'border-border',
            )}
            placeholder="Descripción opcional"
            {...register('descripcion')}
          />
          {errors.descripcion ? (
            <p className="text-xs text-danger">{errors.descripcion.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="precioHora" className="text-sm font-medium text-text">
              Precio por hora
            </label>
            <input
              id="precioHora"
              type="number"
              step="0.01"
              min="0"
              className={cn(
                'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                errors.precioHora ? 'border-danger' : 'border-border',
              )}
              placeholder="25.00"
              {...register('precioHora', { valueAsNumber: true })}
            />
            {errors.precioHora ? (
              <p className="text-xs text-danger">{errors.precioHora.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="capacidad" className="text-sm font-medium text-text">
              Capacidad
            </label>
            <input
              id="capacidad"
              type="number"
              min="1"
              className={cn(
                'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                errors.capacidad ? 'border-danger' : 'border-border',
              )}
              placeholder="22"
              {...register('capacidad', {
                setValueAs: (value) =>
                  value === '' || value === null || value === undefined || Number.isNaN(Number(value))
                    ? undefined
                    : Number(value),
              })}
            />
            {errors.capacidad ? (
              <p className="text-xs text-danger">{errors.capacidad.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="ubicacion" className="text-sm font-medium text-text">
              Ubicación
            </label>
            <input
              id="ubicacion"
              type="text"
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
              placeholder="Sector norte"
              {...register('ubicacion')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tipoCanchaId" className="text-sm font-medium text-text">
              Tipo de cancha
            </label>
            {isCourtTypesError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                No se pudieron cargar los tipos de cancha.
              </p>
            ) : courtTypes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-muted px-4 py-4">
                <p className="text-sm text-text-muted">
                  No existen tipos de cancha registrados.
                </p>
                <Link to="/admin/court-types" className="mt-3 inline-block">
                  <Button type="button" variant="outline" size="sm">
                    Ir a Tipos de cancha
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <select
                  id="tipoCanchaId"
                  className={cn(
                    'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                    'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                    errors.tipoCanchaId ? 'border-danger' : 'border-border',
                  )}
                  {...register('tipoCanchaId', { valueAsNumber: true })}
                >
                  <option value="">Seleccionar tipo</option>
                  {courtTypes.map((courtType) => (
                    <option key={courtType.id} value={courtType.id}>
                      {courtType.nombre}
                    </option>
                  ))}
                </select>
                {errors.tipoCanchaId ? (
                  <p className="text-xs text-danger">{errors.tipoCanchaId.message}</p>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="imagen" className="text-sm font-medium text-text">
            Imagen (URL)
          </label>
          <input
            id="imagen"
            type="url"
            className={cn(
              'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
              'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              errors.imagen ? 'border-danger' : 'border-border',
            )}
            placeholder="https://ejemplo.com/cancha.jpg"
            {...register('imagen')}
          />
          {errors.imagen ? (
            <p className="text-xs text-danger">{errors.imagen.message}</p>
          ) : null}
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3">
          <input
            type="checkbox"
            className="size-4 rounded border-border text-primary-600 focus:ring-primary-500"
            {...register('activa')}
          />
          <span className="text-sm font-medium text-text">Cancha activa</span>
        </label>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={courtTypes.length === 0 || isCourtTypesError}
        >
          {mode === 'create' ? 'Crear cancha' : 'Guardar cambios'}
        </Button>
      </CardFooter>
    </form>
  );
};

export default CourtForm;
