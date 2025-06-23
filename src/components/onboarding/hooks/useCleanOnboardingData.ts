
import { useState, useCallback, useMemo, useEffect } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';
import { useInviteFlow } from '@/hooks/useInviteFlow';

export const useCleanOnboardingData = (inviteToken?: string) => {
  const { user, profile } = useAuth();
  const { inviteDetails, isLoading: inviteLoading, error: inviteError } = useInviteFlow(inviteToken);
  
  const [data, setData] = useState<OnboardingData>({
    memberType: 'club',
    startedAt: new Date().toISOString()
  });

  // Dados do perfil memoizados
  const profileData = useMemo(() => ({
    roleName: getUserRoleName(profile),
    name: profile?.name || '',
    email: profile?.email || user?.email || ''
  }), [profile, user?.email]);

  // Inicialização SIMPLIFICADA
  useEffect(() => {
    console.log('[CLEAN-ONBOARDING] Inicializando dados');
    
    if (inviteToken && inviteDetails) {
      // Fluxo de convite com dados válidos
      const inviteData: OnboardingData = {
        name: '',
        email: inviteDetails.email.toLowerCase(),
        memberType: inviteDetails.role.name === 'formacao' ? 'formacao' : 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };

      setData(inviteData);
      console.log('[CLEAN-ONBOARDING] Dados do convite aplicados');
    } else if (inviteToken && !inviteDetails && !inviteLoading && !inviteError) {
      // Token válido mas aguardando detalhes
      const pendingData: OnboardingData = {
        name: '',
        email: '',
        memberType: 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };

      setData(pendingData);
      console.log('[CLEAN-ONBOARDING] Dados pendentes aplicados');
    } else if (inviteToken && inviteError) {
      // Erro no convite - fallback
      const fallbackData: OnboardingData = {
        name: '',
        email: '',
        memberType: 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };

      setData(fallbackData);
      console.log('[CLEAN-ONBOARDING] Dados fallback aplicados');
    } else if (!inviteToken) {
      // Fluxo normal sem convite
      const memberType: 'club' | 'formacao' = profileData.roleName === 'formacao' ? 'formacao' : 'club';
      
      const regularData: OnboardingData = {
        name: profileData.name,
        email: profileData.email.toLowerCase(),
        memberType,
        startedAt: new Date().toISOString()
      };

      setData(regularData);
      console.log('[CLEAN-ONBOARDING] Dados regulares aplicados');
    }
  }, [inviteToken, inviteDetails, inviteLoading, inviteError, profileData]);

  // Loading otimizado
  const isReallyLoading = useMemo(() => {
    return !!(inviteToken && !inviteDetails && inviteLoading && !inviteError);
  }, [inviteToken, inviteDetails, inviteLoading, inviteError]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    console.log('[CLEAN-ONBOARDING] Atualizando dados:', newData);
    
    const normalizedData = newData.email 
      ? { ...newData, email: newData.email.toLowerCase() }
      : newData;
    
    setData(prevData => ({ ...prevData, ...normalizedData }));
  }, []);

  const initializeCleanData = useCallback(() => {
    console.log('[CLEAN-ONBOARDING] Inicialização manual (já feita via useEffect)');
    // Não faz nada - a inicialização já é feita pelo useEffect
  }, []);

  return {
    data,
    updateData,
    initializeCleanData,
    isInviteLoading: isReallyLoading
  };
};
