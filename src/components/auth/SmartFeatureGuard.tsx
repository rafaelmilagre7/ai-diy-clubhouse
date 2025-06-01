
import React, { ReactNode } from 'react';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SmartFeatureGuardProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

// Mapeamento de features para verificações específicas
const FEATURE_CONFIG = {
  networking: {
    title: 'Networking Inteligente',
    description: 'Conecte-se com outros empreendedores e expanda sua rede de negócios',
    requiresOnboarding: true
  },
  implementation_trail: {
    title: 'Trilha de Implementação',
    description: 'Sua jornada personalizada de implementação de IA baseada no seu perfil',
    requiresOnboarding: true
  }
} as const;

export const SmartFeatureGuard: React.FC<SmartFeatureGuardProps> = ({
  feature,
  children,
  fallback,
  showDetails = false
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isOnboardingComplete, isLoading } = useUnifiedOnboardingValidation();

  const config = FEATURE_CONFIG[feature as keyof typeof FEATURE_CONFIG];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
        <span className="ml-3 text-gray-400">Verificando acesso...</span>
      </div>
    );
  }

  // Admins sempre têm acesso
  const isAdmin = profile?.role === 'admin';
  
  // Para features que requerem onboarding
  if (config?.requiresOnboarding && !isOnboardingComplete && !isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md mx-auto text-center border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-yellow-500" />
              </div>
              <CardTitle className="text-xl text-yellow-800 dark:text-yellow-200">
                {config?.title || 'Funcionalidade'} Bloqueada
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Complete seu onboarding para desbloquear esta funcionalidade
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {config?.description && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>{config.title}:</strong> {config.description}
                  </p>
                </div>
              )}

              {showDetails && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Funcionalidade:</span>
                    <span className="font-medium">{feature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Onboarding:</span>
                    <span className="font-medium text-red-600">
                      Incompleto
                    </span>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={() => navigate('/onboarding-new')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Completar Onboarding
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Se chegou até aqui, tem acesso
  return <>{children}</>;
};
