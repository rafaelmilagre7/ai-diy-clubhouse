
import React, { useEffect, useState } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useOnboardingRequired } from '@/hooks/useOnboardingRequired';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

interface OnboardingLoaderProps {
  children: React.ReactNode;
}

export const OnboardingLoader: React.FC<OnboardingLoaderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, isAdmin } = useSimpleAuth();
  const { isRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [forceShowContent, setForceShowContent] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // TIMEOUT AGRESSIVO: máximo 3 segundos
  useEffect(() => {
    const aggressiveTimeout = setTimeout(() => {
      logger.warn('[ONBOARDING-LOADER] ⏰ TIMEOUT 3s - forçando exibição do conteúdo', {
        authLoading,
        onboardingLoading,
        hasUser: !!user,
        hasProfile: !!profile,
        isAdmin
      });
      setForceShowContent(true);
    }, 3000);

    return () => clearTimeout(aggressiveTimeout);
  }, [authLoading, onboardingLoading, user, profile, isAdmin]);

  // TIMEOUT DE EMERGÊNCIA: 5 segundos
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      logger.error('[ONBOARDING-LOADER] 🚨 EMERGÊNCIA 5s - ativando modo de emergência', {});
      setEmergencyMode(true);
      setForceShowContent(true);
    }, 5000);

    return () => clearTimeout(emergencyTimeout);
  }, []);

  // BYPASS IMEDIATO PARA ADMIN
  useEffect(() => {
    if (!authLoading && user && profile && isAdmin) {
      logger.info('[ONBOARDING-LOADER] 👑 Admin detectado - redirecionando para /admin', {});
      navigate('/admin', { replace: true });
      return;
    }
  }, [user, profile, isAdmin, authLoading, navigate]);

  const totalLoading = authLoading || onboardingLoading;
  const shouldShowLoading = totalLoading && !forceShowContent && !emergencyMode;

  logger.info('[ONBOARDING-LOADER] Estado atual', {
    authLoading,
    onboardingLoading,
    totalLoading,
    forceShowContent,
    shouldShowLoading,
    emergencyMode,
    isAdmin,
    isRequired,
    hasUser: !!user,
    hasProfile: !!profile
  });

  // MODO DE EMERGÊNCIA - botão para forçar carregamento
  if (emergencyMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Carregamento demorado
            </h2>
            <p className="text-neutral-300">
              O carregamento está demorando mais que o esperado. Você pode:
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => {
                logger.info('[ONBOARDING-LOADER] 🚀 Usuário forçou carregamento', {});
                setForceShowContent(true);
                setEmergencyMode(false);
              }}
              className="w-full bg-viverblue hover:bg-viverblue/90"
            >
              Continuar mesmo assim
            </Button>
            
            <Button 
              onClick={() => {
                logger.info('[ONBOARDING-LOADER] 🔄 Usuário recarregou página', {});
                window.location.reload();
              }}
              variant="outline"
              className="w-full"
            >
              Recarregar página
            </Button>
            
            <Button 
              onClick={() => {
                logger.info('[ONBOARDING-LOADER] 🏠 Usuário foi para home', {});
                window.location.href = '/';
              }}
              variant="ghost"
              className="w-full"
            >
              Voltar ao início
            </Button>
          </div>
          
          {import.meta.env.DEV && (
            <div className="text-xs text-neutral-500 mt-4">
              Debug: authLoading={String(authLoading)}, onboardingLoading={String(onboardingLoading)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // DECISÃO: Mostrar loading apenas se necessário E dentro do timeout
  if (shouldShowLoading) {
    return <LoadingScreen message="Verificando seu progresso..." />;
  }

  // SEMPRE mostrar conteúdo após timeout
  return <>{children}</>;
};
