import { Navigate, Outlet, useLocation } from 'react-router-dom';

import Loading from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRoleName } from '@/modules/auth/types';

type ProtectedRouteProps = {
  roles?: UserRoleName[];
};

const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen label="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && user && !roles.includes(user.role.nombre)) {
    const fallbackPath = user.role.nombre === 'ADMIN' ? '/admin' : '/reservar';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
