
import React from 'react';
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface SmartFeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FEATURE_MAP: Record<string, string> = {
  'networking': 'networking',
  'implementation_trail': 'solutions',
  'courses': 'courseManagement',
  'lms_management': 'lmsManagement',
  'tools_admin': 'toolsAdmin',
  'analytics': 'analytics'
};

export const SmartFeatureGuard: React.FC<SmartFeatureGuardProps> = ({
  feature,
  children,
  fallback
}) => {
  const mappedFeature = FEATURE_MAP[feature] || feature;
  const { hasAccess, accessMessage } = useFeatureAccess(mappedFeature);

  if (!hasAccess) {
    return fallback || (
      <Alert variant="destructive" className="my-4 border-destructive/40">
        <Lock className="h-4 w-4" />
        <AlertDescription className="text-destructive-foreground/90">
          {accessMessage || 'Você não tem permissão para acessar este recurso.'}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
