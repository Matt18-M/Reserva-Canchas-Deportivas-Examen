import { Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

type LoadingProps = {
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
};

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

const Loading = ({
  label = 'Cargando...',
  className,
  size = 'md',
  fullScreen = false,
}: LoadingProps) => {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-text-muted',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className={cn('animate-spin text-primary-600', sizeClasses[size])} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
