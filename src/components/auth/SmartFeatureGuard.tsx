
import React from 'react';
import { useSmartFeatureAccess } from '@/hooks/auth/useSmartFeatureAccess';
import { ModernFeatureBlock } from './ModernFeatureBlock';
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
  const { 
    hasAccess, 
    hasRoleAccess, 
    onboardingComplete, 
    blockReason, 
    isLoading 
  } = useSmartFeatureAccess(feature);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#151823] to-[#1a1d2e] flex justify-center items-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <ModernFeatureBlock 
        feature={feature}
        blockReason={blockReason}
        hasRoleAccess={hasRoleAccess}
        onboardingComplete={onboardingComplete}
        showPreview={showPreview}
      />
    );
  }

  return <>{children}</>;
};
