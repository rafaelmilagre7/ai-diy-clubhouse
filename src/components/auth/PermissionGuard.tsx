
import React, { useEffect, useState, useCallback } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  timeoutSeconds?: number;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
  timeoutSeconds = 3 // Timeout padrão reduzido para 3 segundos para experiência mais rápida
}) => {
  const { hasPermission, loading, userPermissions } = usePermissions();
  const { isAdmin, user } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  
  // Verificar se o usuário tem a permissão admin.all (é um superadmin)
  const isAdminByPermission = userPermissions.includes('admin.all');
  
  // Método otimizado para verificar permissão com fallback para verificação de email
  const checkPermission = useCallback(() => {
    // Se já sabemos que é admin pelo contexto, permitir imediatamente
    if (isAdmin) return true;
    
    // Se tem a permissão específica
    if (hasPermission(permission)) return true;
    
    // Se tem permissão admin.all
    if (isAdminByPermission) return true;
    
    // Fallback por email se tivermos um usuário
    if (user?.email) {
      const isAdminByEmail = user.email.includes('@viverdeia.ai') || 
                           user.email === 'admin@teste.com' || 
                           user.email === 'admin@viverdeia.ai';
      return isAdminByEmail;
    }
    
    return false;
  }, [isAdmin, hasPermission, permission, isAdminByPermission, user?.email]);
  
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
    if (loading && checkAttempts < 2) {
      const timer = setTimeout(() => {
        setCheckAttempts(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, checkAttempts]);
  
  // Verificar se deve mostrar o conteúdo devido a timeout
  const showContent = !loading || timedOut || checkAttempts >= 2;
  
  // Se ainda está carregando e não atingiu o timeout
  if (loading && !timedOut && checkAttempts < 2) {
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
  if (showContent && checkPermission()) {
    return <>{children}</>;
  }

  // Se o tempo limite foi atingido, tentar exibir o conteúdo como fallback
  if (timedOut || checkAttempts >= 2) {
    // Se o usuário é admin por email mas falhou a verificação normal, conceder acesso
    if (user?.email && (
      user.email.includes('@viverdeia.ai') || 
      user.email === 'admin@teste.com' || 
      user.email === 'admin@viverdeia.ai'
    )) {
      console.warn(`PermissionGuard: Concedendo acesso para admin por email após timeout: ${permission}`);
      return <>{children}</>;
    }
    
    console.warn(`PermissionGuard: Tempo limite atingido para permissão ${permission}. Mostrando fallback.`);
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Última instância, verificar se é admin pelo email e conceder acesso
    if (isAdmin) {
      console.warn(`PermissionGuard: Concedendo acesso para admin após timeout: ${permission}`);
      return <>{children}</>;
    }
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
