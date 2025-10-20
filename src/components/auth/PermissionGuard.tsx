
import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';

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
  timeoutSeconds = 1
}) => {
  const { profile } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  
  // Verificação rápida e simplificada - APENAS via banco de dados
  const isAdmin = getUserRoleName(profile) === 'admin';
  const isLoading = !profile && !timedOut;
  
  // Se é admin, renderiza imediatamente os filhos
  if (isAdmin) {
    return <>{children}</>;
  }
  
  // Efeito para timeout
  useEffect(() => {
    if (isLoading && !timedOut) {
      const timer = setTimeout(() => {
        setTimedOut(true);
      }, timeoutSeconds * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, timedOut, timeoutSeconds]);
  
  // Mostrar skeleton apenas durante o carregamento inicial
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-skeleton-xl" />
        <Skeleton className="h-skeleton-h w-full rounded-md" />
      </div>
    );
  }

  // Caso contrário, mostrar mensagem de erro ou fallback
  return fallback || (
    <Alert variant="destructive" className="my-4 border-destructive/40">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-semibold">Acesso restrito</AlertTitle>
      <AlertDescription className="text-destructive-foreground/90">
        Você não tem permissão para acessar este recurso.
      </AlertDescription>
    </Alert>
  );
};
