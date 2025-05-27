
import React from 'react';
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';
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
  const { hasAccess, accessMessage } = useFeatureAccess(feature);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showUpgradeMessage && accessMessage) {
    return (
      <Alert variant="default" className="my-4 border-primary/40">
        <Lock className="h-4 w-4" />
        <AlertTitle className="font-semibold">Acesso Restrito</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          {accessMessage}
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
