
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { logger } from '@/utils/logger';

export const useCleanOnboardingData = (inviteToken?: string) => {
  const { user, profile } = useSimpleAuth();
  const { inviteDetails, isLoading: inviteLoading, error: inviteError } = useInviteFlow(inviteToken);
  
  const [data, setData] = useState<OnboardingData>({
    memberType: 'club',
    startedAt: new Date().toISOString()
  });

  // Refs para dados estáveis que não devem causar re-renders
  const userEmailRef = useRef<string>('');
  const userRoleRef = useRef<string>('club');
  const profileDataRef = useRef<{email: string; name: string; roleName: string}>({
    email: '',
    name: '',
    roleName: 'club'
  });

  // Atualizar refs quando dados mudarem (sem causar re-render)
  useEffect(() => {
    if (user?.email && user.email !== userEmailRef.current) {
      userEmailRef.current = user.email;
    }
  }, [user?.email]);

  useEffect(() => {
    if (profile?.user_roles?.name && profile.user_roles.name !== userRoleRef.current) {
      userRoleRef.current = profile.user_roles.name;
    }
  }, [profile?.user_roles?.name]);

  // Dados do perfil memoizados com dependências primitivas estáveis
  const profileData = useMemo(() => {
    const email = user?.email || '';
    const name = profile?.name || '';
    const roleName = profile?.user_roles?.name || 'club';
    
    // Só atualizar se realmente mudou
    if (profileDataRef.current.email !== email || 
        profileDataRef.current.name !== name || 
        profileDataRef.current.roleName !== roleName) {
      profileDataRef.current = { email, name, roleName };
    }
    
    return profileDataRef.current;
  }, [user?.email, profile?.name, profile?.user_roles?.name]);

  // CORREÇÃO CRÍTICA: Inicialização simplificada com proteção contra loops
  useEffect(() => {
    // Proteção: só executar se temos dados mínimos necessários
    if (!user) {
      logger.info('[CLEAN-ONBOARDING] Aguardando usuário...');
      return;
    }

    logger.info('[CLEAN-ONBOARDING] Inicializando dados:', {
      hasInviteToken: !!inviteToken,
      hasInviteDetails: !!inviteDetails,
      inviteLoading,
      inviteError: !!inviteError,
      userEmail: profileData.email,
      userRole: profileData.roleName
    });
    
    // Fluxo COM convite válido
    if (inviteToken && inviteDetails && !inviteError) {
      logger.info('[CLEAN-ONBOARDING] Aplicando dados do convite');
      const inviteData: OnboardingData = {
        name: '',
        email: inviteDetails.email.toLowerCase(),
        memberType: inviteDetails.role.name === 'formacao' ? 'formacao' : 'club',
        startedAt: new Date().toISOString(),
        fromInvite: true,
        inviteToken: inviteToken
      };
      setData(prevData => {
        // Só atualizar se dados realmente mudaram
        if (prevData.email !== inviteData.email || prevData.memberType !== inviteData.memberType) {
          return inviteData;
        }
        return prevData;
      });
      return;
    }

    // Fluxo SEM convite (admin ou usuário normal)
    if (!inviteToken || inviteError) {
      logger.info('[CLEAN-ONBOARDING] Aplicando dados do perfil atual (sem convite)');
      const memberType: 'club' | 'formacao' = profileData.roleName === 'formacao' ? 'formacao' : 'club';
      
      const regularData: OnboardingData = {
        name: profileData.name,
        email: profileData.email.toLowerCase(),
        memberType,
        startedAt: new Date().toISOString(),
        fromInvite: false
      };
      
      setData(prevData => {
        // Só atualizar se dados realmente mudaram
        if (prevData.email !== regularData.email || 
            prevData.memberType !== regularData.memberType ||
            prevData.name !== regularData.name) {
          return regularData;
        }
        return prevData;
      });
      return;
    }

    // Aguardando dados do convite (só se não temos erro)
    if (inviteToken && inviteLoading && !inviteError) {
      logger.info('[CLEAN-ONBOARDING] Aguardando dados do convite...');
      // Não atualizar estado durante loading para evitar loops
    }
  }, [inviteToken, inviteDetails, inviteError, profileData.email, profileData.name, profileData.roleName, user?.id]);

  // Loading OTIMIZADO: só mostra loading se realmente está carregando dados de convite
  const isReallyLoading = useMemo(() => {
    return !!(inviteToken && inviteLoading && !inviteError && !inviteDetails);
  }, [inviteToken, inviteLoading, inviteError, inviteDetails]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    logger.info('[CLEAN-ONBOARDING] Atualizando dados:', newData);
    
    const normalizedData = newData.email 
      ? { ...newData, email: newData.email.toLowerCase() }
      : newData;
    
    setData(prevData => {
      const updatedData = { 
        ...prevData, 
        ...normalizedData,
        // Preservar token se existir
        ...(inviteToken && { inviteToken })
      };
      
      // Só atualizar se dados realmente mudaram
      const hasChanges = Object.keys(normalizedData).some(key => {
        return prevData[key as keyof OnboardingData] !== updatedData[key as keyof OnboardingData];
      });
      
      return hasChanges ? updatedData : prevData;
    });
  }, [inviteToken]);

  const initializeCleanData = useCallback(() => {
    logger.info('[CLEAN-ONBOARDING] Inicialização manual executada');
    // A inicialização já é feita automaticamente pelo useEffect
  }, []);

  return {
    data,
    updateData,
    initializeCleanData,
    isInviteLoading: isReallyLoading
  };
};
