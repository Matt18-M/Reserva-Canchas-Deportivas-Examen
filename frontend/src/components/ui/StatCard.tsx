import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export type StatCardVariant =
  | 'default'
  | 'users'
  | 'courts'
  | 'reservations'
  | 'payments'
  | 'success'
  | 'warning';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: ReactNode;
  variant?: StatCardVariant;
  className?: string;
};

const variantStyles: Record<
  StatCardVariant,
  { card: string; icon: string; value: string; accent: string; glow: string }
> = {
  default: {
    card: 'border-primary-100/80 bg-gradient-to-br from-primary-50/50 via-white to-primary-50/90',
    accent: 'border-t-primary-400',
    icon: 'bg-primary-100 text-primary-700 ring-primary-200/60',
    value: 'text-primary-900',
    glow: 'bg-primary-200/50',
  },
  users: {
    card: 'border-sky-100/80 bg-gradient-to-br from-sky-50/50 via-white to-sky-50/90',
    accent: 'border-t-sky-400',
    icon: 'bg-sky-100 text-sky-700 ring-sky-200/60',
    value: 'text-sky-900',
    glow: 'bg-sky-200/50',
  },
  courts: {
    card: 'border-emerald-100/80 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/90',
    accent: 'border-t-emerald-400',
    icon: 'bg-emerald-100 text-emerald-700 ring-emerald-200/60',
    value: 'text-emerald-900',
    glow: 'bg-emerald-200/50',
  },
  reservations: {
    card: 'border-teal-100/80 bg-gradient-to-br from-teal-50/50 via-white to-teal-50/90',
    accent: 'border-t-teal-400',
    icon: 'bg-teal-100 text-teal-700 ring-teal-200/60',
    value: 'text-teal-900',
    glow: 'bg-teal-200/50',
  },
  payments: {
    card: 'border-cyan-100/80 bg-gradient-to-br from-cyan-50/50 via-white to-cyan-50/90',
    accent: 'border-t-cyan-400',
    icon: 'bg-cyan-100 text-cyan-700 ring-cyan-200/60',
    value: 'text-cyan-900',
    glow: 'bg-cyan-200/50',
  },
  success: {
    card: 'border-green-100/80 bg-gradient-to-br from-green-50/50 via-white to-green-50/90',
    accent: 'border-t-green-400',
    icon: 'bg-green-100 text-green-700 ring-green-200/60',
    value: 'text-green-900',
    glow: 'bg-green-200/50',
  },
  warning: {
    card: 'border-amber-100/80 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/90',
    accent: 'border-t-amber-400',
    icon: 'bg-amber-100 text-amber-700 ring-amber-200/60',
    value: 'text-amber-900',
    glow: 'bg-amber-200/50',
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  className,
}: StatCardProps) => {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-t-[3px] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
        styles.card,
        styles.accent,
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 size-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-80',
          styles.glow,
        )}
        aria-hidden="true"
      />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-text-muted">{title}</p>
            <p className={cn('text-3xl font-bold tracking-tight', styles.value)}>{value}</p>
            {description ? (
              <p className="text-xs leading-relaxed text-text-muted">{description}</p>
            ) : null}
            {trend ? <div className="pt-1">{trend}</div> : null}
          </div>
          <div
            className={cn(
              'rounded-xl p-3 ring-1 transition-transform duration-300 group-hover:scale-105',
              styles.icon,
            )}
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
