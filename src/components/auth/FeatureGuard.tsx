
import React from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock } from 'lucide-react';

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradeMessage?: boolean;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  children,
  fallback,
  showUpgradeMessage = true
}) => {
  const { profile } = useSimpleAuth();
  
  // Verificação simplificada baseada apenas no papel do usuário
  const roleName = profile?.user_roles?.name;
  const hasAccess = roleName && ['admin', 'member', 'membro_club'].includes(roleName);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showUpgradeMessage) {
    return (
      <Alert variant="default" className="my-4 border-primary/40">
        <Lock className="h-4 w-4" />
        <AlertTitle className="font-semibold">Acesso Restrito</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Esta funcionalidade não está disponível para seu tipo de conta atual.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="destructive" className="my-4 border-destructive/40">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-semibold">Acesso Negado</AlertTitle>
      <AlertDescription className="text-destructive-foreground/90">
        Você não tem permissão para acessar este recurso.
      </AlertDescription>
    </Alert>
  );
};
