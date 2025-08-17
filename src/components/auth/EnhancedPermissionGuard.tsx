import React from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedPermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export const EnhancedPermissionGuard: React.FC<EnhancedPermissionGuardProps> = ({
  permission,
  children,
  fallback,
  showAccessDenied = true
}) => {
  const { hasPermission, loading } = usePermissions();
  
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-[80px] w-full rounded-md" />
      </div>
    );
  }

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showAccessDenied) {
    return (
      <Alert variant="destructive" className="my-4 border-destructive/40">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-semibold">Acesso restrito</AlertTitle>
        <AlertDescription className="text-destructive-foreground/90">
          Você não tem permissão para acessar este recurso.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};