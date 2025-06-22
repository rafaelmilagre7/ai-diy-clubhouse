
import { useState, useCallback } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';

export const useCleanOnboardingData = (inviteToken?: string) => {
  const { user, profile } = useAuth();
  const [data, setData] = useState<OnboardingData>({
    memberType: 'club',
    startedAt: new Date().toISOString()
  });

  const initializeCleanData = useCallback(() => {
    const roleName = getUserRoleName(profile);
    const memberType: 'club' | 'formacao' = roleName === 'formacao' ? 'formacao' : 'club';

    // Para convites, SEMPRE inicializar com dados TOTALMENTE VAZIOS
    if (inviteToken) {
      console.log('[CLEAN-ONBOARDING] Inicializando dados TOTALMENTE LIMPOS para convite');
      
      const cleanData: OnboardingData = {
        // Campos obrigatórios VAZIOS para forçar preenchimento manual
        name: '',
        email: '',
        
        // Metadados do convite
        memberType,
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };

      setData(cleanData);
      console.log('[CLEAN-ONBOARDING] Dados TOTALMENTE VAZIOS inicializados para convite:', {
        name: cleanData.name,
        email: cleanData.email,
        memberType: cleanData.memberType,
        fromInvite: cleanData.fromInvite
      });
    } else {
      // Para usuários sem convite, manter comportamento atual
      const regularData: OnboardingData = {
        name: profile?.name || '',
        email: profile?.email || user?.email || '',
        memberType,
        startedAt: new Date().toISOString()
      };

      setData(regularData);
    }
  }, [user, profile, inviteToken]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prevData => ({ ...prevData, ...newData }));
  }, []);

  return {
    data,
    updateData,
    initializeCleanData
  };
};
