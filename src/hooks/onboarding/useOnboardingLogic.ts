
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStatus } from './useOnboardingStatus';

/**
 * Hook isolado para lógica do onboarding
 * FASE 4: Integração com sistema refinado de status
 */
export const useOnboardingLogic = () => {
  const { user, profile } = useAuth();
  const { 
    onboardingAction, 
    isChecking, 
    stats, 
    userName, 
    userEmail, 
    accountAge,
    isNewUser,
    hasCompleted,
    hasSkipped
  } = useOnboardingStatus();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isChecking) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isChecking]);

  // Log para debug em desenvolvimento
  useEffect(() => {
    if (!isLoading && user && onboardingAction) {
      console.log('🚀 Onboarding FASE 4 - Status calculado:', {
        userId: user.id,
        email: user.email,
        action: onboardingAction,
        stats,
        isNewUser,
        hasCompleted,
        hasSkipped,
        accountAge
      });
    }
  }, [isLoading, user, onboardingAction, stats, isNewUser, hasCompleted, hasSkipped, accountAge]);

  return {
    isLoading: isLoading || isChecking,
    user,
    profile,
    
    // Status do onboarding
    onboardingAction,
    canAccessOnboarding: !!user && !!profile && (profile.role === 'membro_club' || profile.role === 'member'),
    
    // Informações do usuário
    userName,
    userEmail,
    userRole: profile?.role || 'membro_club',
    accountAge,
    isNewUser,
    
    // Status específicos
    hasCompleted,
    hasSkipped,
    isRequired: onboardingAction === 'required',
    isSuggested: onboardingAction === 'suggested',
    shouldBypass: onboardingAction === 'bypass',
    
    // Estatísticas
    stats,
    
    // Verificações de acesso
    isAdmin: profile?.role === 'admin',
    isMasterAdmin: user?.email === 'rafael@viverdeia.ai',
    isFormacao: profile?.role === 'formacao'
  };
};
