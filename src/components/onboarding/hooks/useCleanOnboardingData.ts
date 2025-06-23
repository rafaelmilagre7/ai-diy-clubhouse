
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

  // Memoizar dados do perfil para evitar re-cálculos desnecessários
  const profileData = useMemo(() => ({
    roleName: getUserRoleName(profile),
    name: profile?.name || '',
    email: profile?.email || user?.email || ''
  }), [profile, user?.email]);

  // Memoizar função de inicialização para evitar loops infinitos
  const initializeCleanData = useCallback(() => {
    console.log('[CLEAN-ONBOARDING] Iniciando inicialização de dados limpos');
    
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
      console.log('[CLEAN-ONBOARDING] Dados inicializados com convite:', inviteData);
    } else if (!inviteToken) {
      // Para usuários sem convite, usar dados do perfil
      const memberType: 'club' | 'formacao' = profileData.roleName === 'formacao' ? 'formacao' : 'club';
      
      const regularData: OnboardingData = {
        name: profileData.name,
        email: profileData.email,
        memberType,
        startedAt: new Date().toISOString()
      };

      setData(regularData);
      console.log('[CLEAN-ONBOARDING] Dados regulares inicializados:', regularData);
    }
  }, [profileData, inviteToken, inviteDetails]);

  // Memoizar função de update para evitar re-criação
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
