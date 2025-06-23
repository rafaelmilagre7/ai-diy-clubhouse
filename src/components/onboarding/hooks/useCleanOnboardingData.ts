
import { useState, useCallback } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';
import { useInviteDetails } from '@/hooks/useInviteDetails';

export const useCleanOnboardingData = (inviteToken?: string) => {
  const { user, profile } = useAuth();
  const { inviteDetails, loading: inviteLoading } = useInviteDetails(inviteToken);
  
  const [data, setData] = useState<OnboardingData>({
    memberType: 'club',
    startedAt: new Date().toISOString()
  });

  const initializeCleanData = useCallback(() => {
    const roleName = getUserRoleName(profile);
    const memberType: 'club' | 'formacao' = roleName === 'formacao' ? 'formacao' : 'club';

    // Para convites, usar dados do convite quando disponíveis
    if (inviteToken && inviteDetails) {
      console.log('[CLEAN-ONBOARDING] Inicializando com dados do convite');
      
      const inviteData: OnboardingData = {
        // Usar dados do convite
        name: '',
        email: inviteDetails.email,
        
        // Metadados do convite
        memberType: inviteDetails.role.name === 'formacao' ? 'formacao' : 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };

      setData(inviteData);
      console.log('[CLEAN-ONBOARDING] Dados inicializados com convite:', {
        email: inviteData.email,
        memberType: inviteData.memberType,
        fromInvite: inviteData.fromInvite
      });
    } else if (!inviteToken) {
      // Para usuários sem convite, usar dados do perfil
      const regularData: OnboardingData = {
        name: profile?.name || '',
        email: profile?.email || user?.email || '',
        memberType,
        startedAt: new Date().toISOString()
      };

      setData(regularData);
    }
    // Se é convite mas ainda não carregou, não inicializar ainda
  }, [user, profile, inviteToken, inviteDetails]);

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
