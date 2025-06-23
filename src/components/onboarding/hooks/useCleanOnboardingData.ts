
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

  // Memoizar dados do perfil para evitar re-cálculos
  const profileData = useMemo(() => ({
    roleName: getUserRoleName(profile),
    name: profile?.name || '',
    email: profile?.email || user?.email || ''
  }), [profile, user]);

  // Memoizar função de inicialização
  const initializeCleanData = useCallback(() => {
    const memberType: 'club' | 'formacao' = profileData.roleName === 'formacao' ? 'formacao' : 'club';

    // Para convites, usar dados do convite quando disponíveis
    if (inviteToken && inviteDetails) {
      console.log('[CLEAN-ONBOARDING] Inicializando com dados do convite');
      
      const inviteData: OnboardingData = {
        // Dados do convite
        name: '',
        email: inviteDetails.email,
        
        // Metadados
        memberType: inviteDetails.role.name === 'formacao' ? 'formacao' : 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };

      setData(inviteData);
      console.log('[CLEAN-ONBOARDING] Dados inicializados com convite');
    } else if (!inviteToken) {
      // Para usuários sem convite, usar dados do perfil
      const regularData: OnboardingData = {
        name: profileData.name,
        email: profileData.email,
        memberType,
        startedAt: new Date().toISOString()
      };

      setData(regularData);
      console.log('[CLEAN-ONBOARDING] Dados regulares inicializados');
    }
  }, [profileData, inviteToken, inviteDetails]);

  // Memoizar função de update
  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prevData => ({ ...prevData, ...newData }));
  }, []);

  return {
    data,
    updateData,
    initializeCleanData,
    isInviteLoading: inviteLoading
  };
};
