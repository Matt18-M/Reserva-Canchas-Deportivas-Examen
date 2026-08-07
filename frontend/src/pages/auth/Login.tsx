import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getRedirectPathByRole } from '@/modules/auth/auth.service';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { getApiErrorMessage, useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormValues } from '@/modules/auth/schemas';
import { cn } from '@/utils/cn';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRedirectPathByRole(user.role.nombre, from), { replace: true });
    }
  }, [isAuthenticated, navigate, user, from]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      const authenticatedUser = await login(values);
      toast.success('Inicio de sesión exitoso.');
      navigate(getRedirectPathByRole(authenticatedUser.role.nombre, from), {
        replace: true,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo iniciar sesión.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen label="Cargando..." />;
  }

  if (isAuthenticated && user) {
    return (
      <Navigate to={getRedirectPathByRole(user.role.nombre, from)} replace />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-text text-surface shadow-sm">
            <Trophy className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Bienvenido de nuevo
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Ingresa a tu cuenta para gestionar reservas de canchas.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>
              Usa tu correo y contraseña para acceder al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                <label htmlFor="password" className="text-sm font-medium text-text">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={cn(
                    'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
                    'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                    errors.password ? 'border-danger' : 'border-border',
                  )}
                  placeholder="••••••••"
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
                leftIcon={!isSubmitting ? <LogIn className="size-4" /> : undefined}
              >
                Ingresar
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-700 hover:text-primary-800"
              >
                Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
