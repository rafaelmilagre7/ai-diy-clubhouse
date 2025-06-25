
import { useState, useCallback, useMemo, useEffect } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { getUserRoleName } from '@/lib/supabase/types';
import { useInviteFlow } from '@/hooks/useInviteFlow';

export const useCleanOnboardingData = (inviteToken?: string) => {
  const { user, profile } = useSimpleAuth();
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

  // CORREÇÃO CRÍTICA: Inicialização simplificada sem dependência de convite
  useEffect(() => {
    console.log('[CLEAN-ONBOARDING] Inicializando dados:', {
      hasInviteToken: !!inviteToken,
      hasInviteDetails: !!inviteDetails,
      inviteLoading,
      inviteError,
      profileData
    });
    
    // Fluxo COM convite válido
    if (inviteToken && inviteDetails && !inviteError) {
      console.log('[CLEAN-ONBOARDING] Aplicando dados do convite');
      const inviteData: OnboardingData = {
        name: '',
        email: inviteDetails.email.toLowerCase(),
        memberType: inviteDetails.role.name === 'formacao' ? 'formacao' : 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };
      setData(inviteData);
      return;
    }

    // Fluxo SEM convite (admin ou usuário normal)
    if (!inviteToken || inviteError) {
      console.log('[CLEAN-ONBOARDING] Aplicando dados do perfil atual (sem convite)');
      const memberType: 'club' | 'formacao' = profileData.roleName === 'formacao' ? 'formacao' : 'club';
      
      const regularData: OnboardingData = {
        name: profileData.name,
        email: profileData.email.toLowerCase(),
        memberType,
        startedAt: new Date().toISOString(),
        fromInvite: false
      };
      setData(regularData);
      return;
    }

    // Aguardando dados do convite
    if (inviteToken && inviteLoading && !inviteError) {
      console.log('[CLEAN-ONBOARDING] Aguardando dados do convite...');
      const pendingData: OnboardingData = {
        name: '',
        email: '',
        memberType: 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };
      setData(pendingData);
    }
  }, [inviteToken, inviteDetails, inviteLoading, inviteError, profileData]);

  // Loading OTIMIZADO: só mostra loading se realmente está carregando dados de convite
  const isReallyLoading = useMemo(() => {
    return !!(inviteToken && inviteLoading && !inviteError && !inviteDetails);
  }, [inviteToken, inviteLoading, inviteError, inviteDetails]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    console.log('[CLEAN-ONBOARDING] Atualizando dados:', newData);
    
    const normalizedData = newData.email 
      ? { ...newData, email: newData.email.toLowerCase() }
      : newData;
    
    setData(prevData => ({ 
      ...prevData, 
      ...normalizedData,
      // Preservar token se existir
      ...(inviteToken && { inviteToken })
    }));
  }, [inviteToken]);

  const initializeCleanData = useCallback(() => {
    console.log('[CLEAN-ONBOARDING] Inicialização manual executada');
    // A inicialização já é feita automaticamente pelo useEffect
  }, []);

  return {
    data,
    updateData,
    initializeCleanData,
    isInviteLoading: isReallyLoading
  };
};
