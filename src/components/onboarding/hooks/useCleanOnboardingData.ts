
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { OnboardingData } from '../types/onboardingTypes';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

export const useCleanOnboardingData = (token?: string) => {
  const { user, profile } = useAuth();
  const [data, setData] = useState<OnboardingData>({} as OnboardingData);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string>('');

  const { 
    inviteDetails, 
    isLoading: isInviteLoading, 
    error: inviteError 
  } = useInviteFlow(token);

  // Determinar se dados são de convite
  const isFromInvite = useMemo(() => {
    return !!(token && (inviteDetails || InviteTokenManager.hasStoredToken()));
  }, [token, inviteDetails]);

  const initializeCleanData = useCallback(async () => {
    try {
      console.log('[CLEAN-DATA] Inicializando dados limpos:', {
        hasUser: !!user,
        hasProfile: !!profile,
        hasToken: !!token,
        hasInviteDetails: !!inviteDetails,
        isFromInvite
      });

      let cleanData: OnboardingData = {
        memberType: 'club',
        startedAt: new Date().toISOString(),
        fromInvite: isFromInvite
      };

      // Dados do convite têm prioridade
      if (isFromInvite && inviteDetails) {
        console.log('[CLEAN-DATA] Usando dados do convite');
        cleanData = {
          ...cleanData,
          email: inviteDetails.email,
          memberType: inviteDetails.role.name === 'formacao' ? 'formacao' : 'club',
          fromInvite: true,
          inviteToken: token
        };
      }
      // Fallback para dados do usuário autenticado
      else if (user) {
        console.log('[CLEAN-DATA] Usando dados do usuário autenticado');
        cleanData = {
          ...cleanData,
          email: user.email || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name || profile?.name || '',
          memberType: profile?.role === 'formacao' ? 'formacao' : 'club'
        };
      }
      // Fallback final - dados mínimos
      else {
        console.log('[CLEAN-DATA] Usando dados mínimos (fallback)');
        cleanData = {
          ...cleanData,
          memberType: 'club'
        };
      }

      // Adicionar timestamp e metadados
      cleanData.startedAt = new Date().toISOString();
      cleanData.lastUpdated = new Date().toISOString();

      console.log('[CLEAN-DATA] Dados inicializados:', {
        email: cleanData.email,
        name: cleanData.name,
        memberType: cleanData.memberType,
        fromInvite: cleanData.fromInvite
      });

      setData(cleanData);
      setIsInitialized(true);
      setError('');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inicializar dados';
      console.error('[CLEAN-DATA] Erro na inicialização:', err);
      setError(errorMessage);
      
      // Fallback de emergência - dados básicos
      setData({
        memberType: 'club',
        startedAt: new Date().toISOString(),
        fromInvite: false
      });
      setIsInitialized(true);
    }
  }, [user, profile, token, inviteDetails, isFromInvite]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    try {
      setData(prevData => {
        const updatedData = {
          ...prevData,
          ...newData,
          lastUpdated: new Date().toISOString()
        };
        
        console.log('[CLEAN-DATA] Dados atualizados:', Object.keys(newData));
        return updatedData;
      });
    } catch (err) {
      console.error('[CLEAN-DATA] Erro ao atualizar dados:', err);
    }
  }, []);

  // Auto-inicializar quando dependências estiverem prontas
  useEffect(() => {
    if (!isInitialized) {
      // Se há token, aguardar carregamento do convite
      if (token && isInviteLoading) {
        console.log('[CLEAN-DATA] Aguardando carregamento do convite...');
        return;
      }

      // Se há erro no convite e não temos dados do usuário, usar fallback
      if (token && inviteError && !user) {
        console.warn('[CLEAN-DATA] Erro no convite, mas continuando com fallback');
      }

      // Inicializar dados
      initializeCleanData();
    }
  }, [isInitialized, token, isInviteLoading, inviteError, user, initializeCleanData]);

  // Tratar erro do convite
  useEffect(() => {
    if (inviteError) {
      console.warn('[CLEAN-DATA] Erro no convite:', inviteError);
      setError(`Erro no convite: ${inviteError}`);
    }
  }, [inviteError]);

  return {
    data,
    updateData,
    initializeCleanData,
    isInviteLoading,
    error,
    isInitialized
  };
};
