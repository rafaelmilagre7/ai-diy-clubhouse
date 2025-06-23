
import { useState, useCallback, useMemo } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';
import { useInviteFlow } from '@/hooks/useInviteFlow';

export const useCleanOnboardingData = (inviteToken?: string) => {
  const { user, profile } = useAuth();
  const { inviteDetails, isLoading: inviteLoading } = useInviteFlow(inviteToken);
  
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

  // Inicialização simplificada - sem fallbacks complexos
  const initializeCleanData = useCallback(() => {
    console.log('[CLEAN-ONBOARDING] Inicializando dados');
    
    if (inviteToken && inviteDetails) {
      // Fluxo de convite - direto e simples
      const inviteData: OnboardingData = {
        name: '',
        email: inviteDetails.email,
        memberType: inviteDetails.role.name === 'formacao' ? 'formacao' : 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };

      setData(inviteData);
      console.log('[CLEAN-ONBOARDING] Dados do convite aplicados');
    } else if (!inviteToken) {
      // Fluxo normal - direto e simples
      const memberType: 'club' | 'formacao' = profileData.roleName === 'formacao' ? 'formacao' : 'club';
      
      const regularData: OnboardingData = {
        name: profileData.name,
        email: profileData.email,
        memberType,
        startedAt: new Date().toISOString()
      };

      setData(regularData);
      console.log('[CLEAN-ONBOARDING] Dados regulares aplicados');
    }
  }, [profileData, inviteToken, inviteDetails]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    console.log('[CLEAN-ONBOARDING] Atualizando dados:', newData);
    setData(prevData => ({ ...prevData, ...newData }));
  }, []);

  return {
    data,
    updateData,
    initializeCleanData,
    isInviteLoading: inviteLoading
  };
};
