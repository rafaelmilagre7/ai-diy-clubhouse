
import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { OnboardingData } from '../types/onboardingTypes';
import { getUserRoleName } from '@/lib/supabase/types';
import { useSearchParams } from 'react-router-dom';

export const useOnboardingInitialization = (
  data: OnboardingData,
  updateData: (newData: Partial<OnboardingData>) => void
) => {
  const { user, profile } = useSimpleAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const inviteToken = searchParams.get('token');
  const roleName = getUserRoleName(profile);
  const memberType: 'club' | 'formacao' = roleName === 'formacao' ? 'formacao' : 'club';

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // CORREÇÃO: Para convites, sempre inicializar com dados limpos
        if (inviteToken) {
          console.log('[ONBOARDING-INIT] Modo convite detectado - inicializando dados limpos');
          
          const cleanData: OnboardingData = {
            // Apenas dados essenciais
            name: '',
            email: user?.email || '',
            
            // Metadados do convite
            memberType,
            startedAt: new Date().toISOString(),
            fromInvite: true,
            inviteToken: inviteToken,
            
            // ADICIONADO: Inicializar flags de controle
            isEmailFromInvite: false,
            isNameFromInvite: false,
            isPhoneFromInvite: false
          };
          
          console.log('[ONBOARDING-INIT] Dados limpos para convite:', {
            hasEmail: !!cleanData.email,
            memberType: cleanData.memberType,
            fromInvite: cleanData.fromInvite
          });
          
          updateData(cleanData);
        } else {
          // Para usuários sem convite, manter comportamento atual apenas se não há dados
          if (Object.keys(data).length === 1) {
            console.log('[ONBOARDING-INIT] Inicializando dados normais (sem convite)');
            
            const regularData: OnboardingData = {
              name: profile?.name || '',
              email: profile?.email || user?.email || '',
              memberType,
              startedAt: new Date().toISOString(),
              // ADICIONADO: Inicializar flags como false para usuários normais
              isEmailFromInvite: false,
              isNameFromInvite: false,
              isPhoneFromInvite: false
            };
            
            updateData(regularData);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do onboarding:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, profile, memberType, inviteToken, updateData]);

  return {
    isLoading,
    memberType
  };
};
