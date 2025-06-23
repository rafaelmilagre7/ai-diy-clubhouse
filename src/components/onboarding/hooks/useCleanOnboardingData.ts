
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

  // MELHORIA 1: Eliminar loop de dependência - usar useEffect direto
  useEffect(() => {
    console.log('[CLEAN-ONBOARDING] Detectando mudanças nos dados');
    
    if (inviteToken && inviteDetails) {
      // Fluxo de convite - dados do convite carregados
      const inviteData: OnboardingData = {
        name: '',
        email: inviteDetails.email.toLowerCase(), // MELHORIA 3: Normalizar email
        memberType: inviteDetails.role.name === 'formacao' ? 'formacao' : 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };

      setData(inviteData);
      console.log('[CLEAN-ONBOARDING] Dados do convite aplicados com email normalizado');
    } else if (inviteToken && !inviteDetails && !inviteLoading && !inviteError) {
      // MELHORIA 2: Token existe mas ainda aguardando dados do convite
      const pendingData: OnboardingData = {
        name: '',
        email: '',
        memberType: 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };

      setData(pendingData);
      console.log('[CLEAN-ONBOARDING] Dados pendentes com token aplicados');
    } else if (inviteToken && inviteError) {
      // MELHORIA 5: Tratar erro específico do convite
      const fallbackData: OnboardingData = {
        name: '',
        email: '',
        memberType: 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };

      setData(fallbackData);
      console.log('[CLEAN-ONBOARDING] Dados fallback por erro no convite aplicados');
    } else if (!inviteToken) {
      // Fluxo normal - dados do perfil
      const memberType: 'club' | 'formacao' = profileData.roleName === 'formacao' ? 'formacao' : 'club';
      
      const regularData: OnboardingData = {
        name: profileData.name,
        email: profileData.email.toLowerCase(), // MELHORIA 3: Normalizar email
        memberType,
        startedAt: new Date().toISOString()
      };

      setData(regularData);
      console.log('[CLEAN-ONBOARDING] Dados regulares aplicados com email normalizado');
    }
  }, [inviteToken, inviteDetails, inviteLoading, inviteError, profileData]);

  // MELHORIA 2: Loading otimizado - só considerar loading se realmente necessário
  const isReallyLoading = useMemo(() => {
    // Só está loading se tem token, não tem dados do convite E está carregando
    return !!(inviteToken && !inviteDetails && inviteLoading && !inviteError);
  }, [inviteToken, inviteDetails, inviteLoading, inviteError]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    console.log('[CLEAN-ONBOARDING] Atualizando dados:', newData);
    
    // MELHORIA 3: Normalizar email se fornecido
    const normalizedData = newData.email 
      ? { ...newData, email: newData.email.toLowerCase() }
      : newData;
    
    setData(prevData => ({ ...prevData, ...normalizedData }));
  }, []);

  // Função de inicialização manual (mantida por compatibilidade)
  const initializeCleanData = useCallback(() => {
    console.log('[CLEAN-ONBOARDING] Inicialização manual solicitada (já feita via useEffect)');
    // Não faz nada - a inicialização já é feita pelo useEffect
  }, []);

  return {
    data,
    updateData,
    initializeCleanData,
    isInviteLoading: isReallyLoading
  };
};
