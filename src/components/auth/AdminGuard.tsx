import { ReactNode } from 'react';
import { useIsAdmin } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  showError?: boolean;
}

export function AdminGuard({ 
  children, 
  fallback, 
  showError = true 
}: AdminGuardProps) {
  const isAdmin = useIsAdmin();

  if (isAdmin) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showError) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Acesso restrito a administradores
        </AlertDescription>
      </Alert>
    </div>
  );
}