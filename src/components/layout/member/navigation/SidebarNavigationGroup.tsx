
import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarNavigationGroupProps {
  title: string;
  children: React.ReactNode;
  sidebarOpen: boolean;
  className?: string;
}

export const SidebarNavigationGroup: React.FC<SidebarNavigationGroupProps> = ({
  title,
  children,
  sidebarOpen,
  className
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      {sidebarOpen && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};
