import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Shield } from 'lucide-react';

interface PermissionBoundaryProps {
  children: ReactNode;
  requiredPermission: 'admin' | 'formacao' | 'member' | 'authenticated';
  fallback?: ReactNode;
  showError?: boolean;
}

export function PermissionBoundary({
  children,
  requiredPermission,
  fallback,
  showError = true
}: PermissionBoundaryProps) {
  const { data: permissions, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar permissão
  const hasPermission = (() => {
    switch (requiredPermission) {
      case 'admin':
        return permissions?.isAdmin || false;
      case 'formacao':
        return permissions?.canAccessFormacao || false;
      case 'member':
        return permissions?.isMember || false;
      case 'authenticated':
        return permissions?.roleName !== null;
      default:
        return false;
    }
  })();

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showError) {
    return null;
  }

  return (
    <Alert variant="destructive" className="max-w-md mx-auto">
      <Shield className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Você não tem permissão para acessar este conteúdo.
        {requiredPermission !== 'authenticated' && (
          <span className="text-sm opacity-75">
            Permissão necessária: {requiredPermission}
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}