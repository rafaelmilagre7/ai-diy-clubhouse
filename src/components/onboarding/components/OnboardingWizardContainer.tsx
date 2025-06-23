
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboardingWizard } from '../hooks/useOnboardingWizard';
import { useCleanOnboardingData } from '../hooks/useCleanOnboardingData';
import { useOnboardingCleanup } from '../hooks/useOnboardingCleanup';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

interface OnboardingWizardContainerProps {
  children: (props: ReturnType<typeof useOnboardingWizard> & {
    data: any;
    memberType: 'club' | 'formacao';
    isLoading: boolean;
  }) => React.ReactNode;
}

type InitializationState = 'idle' | 'loading' | 'ready' | 'error';

export const OnboardingWizardContainer = ({ children }: OnboardingWizardContainerProps) => {
  const [searchParams] = useSearchParams();
  const [initializationState, setInitializationState] = useState<InitializationState>('idle');
  
  const { cleanupForInvite } = useOnboardingCleanup();
  
  // CORREÇÃO 1: Obter token de múltiplas fontes
  const inviteToken = useMemo(() => {
    // 1. URL params tem prioridade
    const urlToken = searchParams.get('token');
    if (urlToken) {
      console.log('[WIZARD-CONTAINER] Token encontrado na URL');
      return urlToken;
    }
    
    // 2. Fallback para token armazenado
    const storedToken = InviteTokenManager.getStoredToken();
    if (storedToken) {
      console.log('[WIZARD-CONTAINER] Token encontrado no storage');
      return storedToken;
    }
    
    // 3. Tentar obter do manager geral
    const managerToken = InviteTokenManager.getToken();
    if (managerToken) {
      console.log('[WIZARD-CONTAINER] Token encontrado via manager');
      return managerToken;
    }
    
    return null;
  }, [searchParams]);

  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  // Memoizar o memberType para evitar re-renders
  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // CORREÇÃO: Inicialização melhorada com suporte a token
  useEffect(() => {
    let isCancelled = false;

    const setupOnboarding = async () => {
      try {
        if (initializationState !== 'idle') {
          return;
        }

        console.log('[WIZARD-CONTAINER] Iniciando configuração com token:', inviteToken);
        setInitializationState('loading');
        
        // Se há token, armazenar para garantir persistência
        if (inviteToken) {
          InviteTokenManager.storeToken(inviteToken);
          console.log('[WIZARD-CONTAINER] Token de convite armazenado');
          cleanupForInvite();
        }

        // Aguardar carregamento do convite se necessário
        if (inviteToken && isInviteLoading) {
          console.log('[WIZARD-CONTAINER] Aguardando carregamento do convite...');
          return;
        }

        if (!isCancelled) {
          await initializeCleanData();
          setInitializationState('ready');
          console.log('[WIZARD-CONTAINER] Configuração concluída:', {
            hasToken: !!inviteToken,
            memberType: cleanData.memberType,
            email: cleanData.email
          });
        }
      } catch (error) {
        console.error('[WIZARD-CONTAINER] Erro na configuração:', error);
        if (!isCancelled) {
          setInitializationState('error');
        }
      }
    };

    setupOnboarding();

    return () => {
      isCancelled = true;
    };
  }, [inviteToken, isInviteLoading, initializationState, initializeCleanData, cleanupForInvite]);

  // Estado de loading melhorado
  const isLoading = useMemo(() => {
    if (initializationState === 'loading') return true;
    if (initializationState === 'idle') return true;
    if (inviteToken && isInviteLoading) return true;
    if (initializationState === 'error') return false;
    
    const hasMinimalData = cleanData.memberType && (cleanData.email || cleanData.name);
    if (!hasMinimalData && initializationState !== 'ready') return true;
    
    return false;
  }, [initializationState, inviteToken, isInviteLoading, cleanData]);

  // Memoizar updateData para evitar re-criação
  const memoizedUpdateData = useCallback((newData: any) => {
    // CORREÇÃO: Preservar token nos dados se presente
    const dataWithToken = inviteToken ? { ...newData, inviteToken } : newData;
    updateData(dataWithToken);
  }, [updateData, inviteToken]);

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  // Se houver erro de inicialização, mostrar estado de erro
  if (initializationState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-2">Erro na Inicialização</h2>
          <p className="text-neutral-300">Não foi possível carregar os dados do onboarding.</p>
          <button 
            onClick={() => setInitializationState('idle')} 
            className="mt-4 px-4 py-2 bg-viverblue rounded text-white hover:bg-viverblue/90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {children({
        ...wizardProps,
        data: { ...cleanData, inviteToken }, // Garantir que token está disponível
        memberType,
        isLoading
      })}
    </>
  );
};
