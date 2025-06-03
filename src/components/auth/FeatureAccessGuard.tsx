
import React, { ReactNode } from 'react';
import { useSmartFeatureAccess } from '@/hooks/auth/useSmartFeatureAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, User, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureAccessGuardProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

export const FeatureAccessGuard: React.FC<FeatureAccessGuardProps> = ({
  feature,
  children,
  fallback,
  showDetails = false
}) => {
  const navigate = useNavigate();
  const { 
    hasAccess, 
    hasRoleAccess, 
    onboardingComplete, 
    userRole, 
    blockReason, 
    blockMessage, 
    isLoading 
  } = useSmartFeatureAccess(feature);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getActionButton = () => {
    if (blockReason === 'incomplete_onboarding') {
      return (
        <Button 
          onClick={() => navigate('/onboarding-new')}
          className="bg-viverblue hover:bg-viverblue/90"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Completar Onboarding
        </Button>
      );
    }

    if (blockReason === 'insufficient_role') {
      return (
        <Button 
          onClick={() => navigate('/dashboard')}
          variant="outline"
        >
          <User className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
      );
    }

    return null;
  };

  const getIcon = () => {
    switch (blockReason) {
      case 'incomplete_onboarding':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      case 'insufficient_role':
        return <Lock className="w-12 h-12 text-red-500" />;
      default:
        return <Lock className="w-12 h-12 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md mx-auto text-center">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <CardTitle className="text-xl">
              Acesso Restrito
            </CardTitle>
            <CardDescription>
              {blockMessage}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {showDetails && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Funcionalidade:</span>
                  <span className="font-medium">{feature}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seu papel:</span>
                  <span className="font-medium">{userRole || 'Não definido'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Onboarding:</span>
                  <span className={`font-medium ${onboardingComplete ? 'text-green-600' : 'text-red-600'}`}>
                    {onboardingComplete ? 'Completo' : 'Incompleto'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Permissão de papel:</span>
                  <span className={`font-medium ${hasRoleAccess ? 'text-green-600' : 'text-red-600'}`}>
                    {hasRoleAccess ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            )}
            
            {getActionButton()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
