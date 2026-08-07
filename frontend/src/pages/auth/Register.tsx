import { zodResolver } from '@hookform/resolvers/zod';
import { Trophy, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getRedirectPathByRole } from '@/modules/auth/auth.service';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { getApiErrorMessage, useAuth } from '@/contexts/AuthContext';
import { registerSchema, type RegisterFormValues } from '@/modules/auth/schemas';
import { cn } from '@/utils/cn';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, isLoading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      telefono: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRedirectPathByRole(user.role.nombre), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...values,
        telefono: values.telefono?.trim() ? values.telefono.trim() : undefined,
      };

      await registerUser(payload);
      toast.success('Cuenta creada correctamente. Inicia sesión para continuar.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo completar el registro.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen label="Cargando..." />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getRedirectPathByRole(user.role.nombre)} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-text text-surface shadow-sm">
            <Trophy className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Crea tu cuenta
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Regístrate para reservar canchas deportivas en línea.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>
              Completa tus datos para crear una cuenta de cliente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium text-text">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    autoComplete="given-name"
                    className={cn(
                      'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                      'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
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
                    autoComplete="family-name"
                    className={cn(
                      'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                      'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
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
                <label htmlFor="email" className="text-sm font-medium text-text">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={cn(
                    'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                    'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                    errors.email ? 'border-danger' : 'border-border',
                  )}
                  placeholder="tu@email.com"
                  {...register('email')}
                />
                {errors.email ? (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="telefono" className="text-sm font-medium text-text">
                  Teléfono (opcional)
                </label>
                <input
                  id="telefono"
                  type="tel"
                  autoComplete="tel"
                  className={cn(
                    'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                    'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                  )}
                  placeholder="+593 99 999 9999"
                  {...register('telefono')}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-text">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className={cn(
                    'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                    'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                    errors.password ? 'border-danger' : 'border-border',
                  )}
                  placeholder="Mínimo 8 caracteres"
                  {...register('password')}
                />
                {errors.password ? (
                  <p className="text-xs text-danger">{errors.password.message}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                leftIcon={!isSubmitting ? <UserPlus className="size-4" /> : undefined}
              >
                Crear cuenta
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-700 hover:text-primary-800"
              >
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
