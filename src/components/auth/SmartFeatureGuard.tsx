
import React from 'react';
import { useSmartFeatureAccess } from '@/hooks/auth/useSmartFeatureAccess';
import { SmartFeatureBlock } from './SmartFeatureBlock';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface SmartFeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  showPreview?: boolean;
  fallback?: React.ReactNode;
}

export const SmartFeatureGuard: React.FC<SmartFeatureGuardProps> = ({
  feature,
  children,
  showPreview = true,
  fallback
}) => {
  const { data: accessData, isLoading } = useSmartFeatureAccess(feature);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  if (!accessData?.hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <SmartFeatureBlock 
        feature={feature}
        blockReason={accessData?.blockReason || 'insufficient_role'}
        hasRoleAccess={accessData?.hasRoleAccess || false}
        setupComplete={accessData?.setupComplete || false}
        showPreview={showPreview}
      />
    );
  }

  return <>{children}</>;
};
