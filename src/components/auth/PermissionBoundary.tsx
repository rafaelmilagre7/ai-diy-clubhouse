import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionBoundaryProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean; // se true, precisa de TODAS as permissões. se false, precisa de PELO MENOS uma
  adminOnly?: boolean;
  formacaoAccess?: boolean;
  fallback?: React.ReactNode;
  showError?: boolean;
  loadingComponent?: React.ReactNode;
}

export const PermissionBoundary: React.FC<PermissionBoundaryProps> = ({
  children,
  requiredPermissions = [],
  requireAll = true,
  adminOnly = false,
  formacaoAccess = false,
  fallback,
  showError = true,
  loadingComponent
}) => {
  const { data: permissions, isLoading } = usePermissions();

  // Loading state
  if (isLoading) {
    return loadingComponent || (
      <div className="space-y-3">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-[80px] w-full rounded-md" />
      </div>
    );
  }

  // Verificação de permissões
  const hasAccess = () => {
    if (!permissions) return false;

    // Admin sempre tem acesso
    if (adminOnly && permissions.isAdmin) return true;
    
    // Acesso para formação
    if (formacaoAccess && (permissions.isAdmin || permissions.isFormacao)) return true;

    // Verificação de permissões específicas
    if (requiredPermissions.length > 0) {
      if (requireAll) {
        // Precisa de TODAS as permissões
        return requiredPermissions.every(permission => 
          permissions.isAdmin || permissions.canAccessAdmin
        );
      } else {
        // Precisa de PELO MENOS uma permissão
        return requiredPermissions.some(permission => 
          permissions.isAdmin || permissions.canAccessAdmin
        );
      }
    }

    // Se não há permissões específicas requeridas mas tem adminOnly ou formacaoAccess
    if (adminOnly) return permissions.isAdmin;
    if (formacaoAccess) return permissions.isAdmin || permissions.isFormacao;

    // Por padrão, permite acesso se não há restrições específicas
    return true;
  };

  // Se tem acesso, renderiza os filhos
  if (hasAccess()) {
    return <>{children}</>;
  }

  // Se há um fallback personalizado, usa ele
  if (fallback) {
    return <>{fallback}</>;
  }

  // Se não deve mostrar erro, não renderiza nada
  if (!showError) {
    return null;
  }

  // Renderiza erro padrão
  return (
    <div className="flex items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          {adminOnly 
            ? "Acesso restrito a administradores"
            : formacaoAccess 
              ? "Acesso restrito à equipe de formação"
              : "Você não tem permissão para acessar este recurso"
          }
        </AlertDescription>
      </Alert>
    </div>
  );
};