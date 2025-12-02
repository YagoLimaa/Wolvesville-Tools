import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export const EmptyState = ({ icon, title, description, className }: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4 rounded-lg bg-background/50 p-8 text-center',
        className
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};