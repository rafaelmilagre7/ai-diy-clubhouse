
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { 
  getOnboardingAction, 
  logOnboardingDecision, 
  getOnboardingStats,
  hasOnboardingPending 
} from './utils/onboardingUtils';

/**
 * Hook para verificar status do onboarding - FASE 4
 * Sistema inteligente de verificação de status
 */
export const useOnboardingStatus = () => {
  const { user, profile, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  // Calcular ação do onboarding
  const onboardingAction = useMemo(() => {
    if (isLoading || !user) return null;
    return getOnboardingAction(user.email, profile);
  }, [user, profile, isLoading]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    return getOnboardingStats(profile);
  }, [profile]);

  // Log da decisão quando calculada
  useEffect(() => {
    if (onboardingAction && user) {
      logOnboardingDecision(user.email, profile, onboardingAction);
    }
  }, [onboardingAction, user, profile]);

  // Controlar loading
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsChecking(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return {
    // Status principal
    onboardingAction,
    isChecking: isLoading || isChecking,
    
    // Estados específicos
    shouldBypass: onboardingAction === 'bypass',
    isRequired: onboardingAction === 'required',
    isSuggested: onboardingAction === 'suggested',
    isOptional: onboardingAction === 'optional',
    
    // Verificações úteis
    isPending: hasOnboardingPending(profile),
    canAccessOnboarding: user && profile && (profile.role === 'membro_club' || profile.role === 'member'),
    
    // Estatísticas
    stats,
    
    // Dados do usuário
    user,
    profile,
    
    // Informações específicas
    userName: profile?.name || user?.user_metadata?.name || 'Usuário',
    userEmail: user?.email || null,
    accountAge: stats?.accountAgeDays || 0,
    isNewUser: stats?.isNewUser || false,
    hasCompleted: stats?.hasCompleted || false,
    hasSkipped: stats?.hasSkipped || false
  };
};
