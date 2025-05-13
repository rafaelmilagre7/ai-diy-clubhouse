
import React, { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  timeoutSeconds?: number; // Novo: timeout em segundos
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
  timeoutSeconds = 5 // Timeout padrão de 5 segundos
}) => {
  const { hasPermission, loading, userPermissions } = usePermissions();
  const [timedOut, setTimedOut] = useState(false);

  // Verificar se o usuário tem a permissão admin.all (é um superadmin)
  const isAdmin = userPermissions.includes('admin.all');
  
  // Estado para contar verificações de permissão
  const [checkAttempts, setCheckAttempts] = useState(0);
  
  // Efeito para timeout
  useEffect(() => {
    if (loading && !timedOut) {
      const timer = setTimeout(() => {
        console.log(`PermissionGuard timeout atingido para permissão: ${permission}`);
        setTimedOut(true);
      }, timeoutSeconds * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, timedOut, timeoutSeconds, permission]);
  
  // Efeito para aumentar contador de tentativas
  useEffect(() => {
    if (loading && checkAttempts < 3) {
      const timer = setTimeout(() => {
        setCheckAttempts(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, checkAttempts]);
  
  // Verificar se deve mostrar o conteúdo devido a timeout
  const showContent = !loading || timedOut || checkAttempts >= 3;
  
  // Se ainda está carregando e não atingiu o timeout
  if (loading && !timedOut && checkAttempts < 3) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <Skeleton className="h-[120px] w-full rounded-md" />
      </div>
    );
  }

  // Se for admin ou tiver a permissão específica, permite acesso
  if (showContent && (hasPermission(permission) || isAdmin)) {
    return <>{children}</>;
  }

  // Se o tempo limite foi atingido, tentar exibir o conteúdo como fallback
  if (timedOut || checkAttempts >= 3) {
    console.warn(`PermissionGuard: Tempo limite atingido para permissão ${permission}. Mostrando conteúdo como fallback.`);
    if (fallback) {
      return <>{fallback}</>;
    }
    return <>{children}</>; // Em último caso, exibir o conteúdo mesmo
  }

  // Caso contrário, mostrar mensagem de erro
  return fallback || (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Acesso restrito</AlertTitle>
      <AlertDescription>
        Você não tem permissão para acessar este recurso.
      </AlertDescription>
    </Alert>
  );
};
