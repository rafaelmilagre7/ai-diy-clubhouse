
import React from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback
}) => {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return <div className="p-4 animate-pulse">Verificando permissões...</div>;
  }

  if (!hasPermission(permission)) {
    return fallback || (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso restrito</AlertTitle>
        <AlertDescription>
          Você não tem permissão para acessar este recurso.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
