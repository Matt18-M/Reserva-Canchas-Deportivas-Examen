import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

type LogoProps = {
  collapsed?: boolean;
  className?: string;
};

const Logo = ({ collapsed = false, className }: LogoProps) => {
  return (
    <Link
      to="/admin"
      className={cn(
        'flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-muted',
        className,
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-500/25">
        <Trophy className="size-4" strokeWidth={2} />
      </div>
      {!collapsed ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-text">
            Canchas Pro
          </p>
          <p className="truncate text-xs text-text-muted">Panel administrativo</p>
        </div>
      ) : null}
    </Link>
  );
};

export default Logo;
