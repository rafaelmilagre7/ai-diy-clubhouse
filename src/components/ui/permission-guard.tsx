import React, { ReactNode } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { AccessBlocked } from '@/components/ui/access-blocked';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  feature?: 'solutions' | 'tools' | 'learning' | 'benefits' | 'networking' | 'events';
  showAccessBlocked?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
  feature = 'solutions',
  showAccessBlocked = true
}) => {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
    );
  }

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showAccessBlocked) {
    return <AccessBlocked feature={feature} />;
  }

  return null;
};