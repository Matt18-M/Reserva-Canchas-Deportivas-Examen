import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: ReactNode;
  className?: string;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatCardProps) => {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-muted">{title}</p>
            <p className="text-3xl font-semibold tracking-tight text-text">{value}</p>
            {description ? (
              <p className="text-xs text-text-muted">{description}</p>
            ) : null}
            {trend ? <div className="pt-1">{trend}</div> : null}
          </div>
          <div className="rounded-xl border border-border bg-surface-muted p-3">
            <Icon className="size-5 text-primary-600" strokeWidth={1.75} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
