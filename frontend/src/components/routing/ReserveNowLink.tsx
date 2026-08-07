import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getRedirectPathByRole } from '@/modules/auth/auth.service';

type ReserveNowLinkProps = {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  rightIcon?: ReactNode;
  buttonClassName?: string;
};

const ReserveNowLink = ({
  children,
  className,
  variant = 'secondary',
  size = 'sm',
  rightIcon,
  buttonClassName,
}: ReserveNowLinkProps) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const target = getRedirectPathByRole(user.role.nombre);

    return (
      <Link to={target} className={className}>
        <Button variant={variant} size={size} rightIcon={rightIcon} className={buttonClassName}>
          {children}
        </Button>
      </Link>
    );
  }

  return (
    <Link to="/login" state={{ from: '/reservar' }} className={className}>
      <Button variant={variant} size={size} rightIcon={rightIcon} className={buttonClassName}>
        {children}
      </Button>
    </Link>
  );
};

export default ReserveNowLink;
