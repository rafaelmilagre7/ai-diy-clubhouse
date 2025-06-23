
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const { cleanupForInvite } = useOnboardingCleanup();
  
  // Obter token de múltiplas fontes com priorização
  const inviteToken = useMemo(() => {
    // 1. URL params tem prioridade
    const urlToken = searchParams.get('token');
    if (urlToken) {
      console.log('[WIZARD-CONTAINER] Token encontrado na URL:', urlToken.substring(0, 8) + '...');
      return urlToken;
    }
    
    // 2. Fallback para token armazenado
    const storedToken = InviteTokenManager.getStoredToken();
    if (storedToken) {
      console.log('[WIZARD-CONTAINER] Token encontrado no storage:', storedToken.substring(0, 8) + '...');
      return storedToken;
    }
    
    console.log('[WIZARD-CONTAINER] Nenhum token encontrado');
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
  
  // Inicialização simplificada e robusta
  useEffect(() => {
    let isCancelled = false;

    const initializeOnboarding = async () => {
      // Evitar re-inicialização desnecessária
      if (initializationState === 'ready' || initializationState === 'loading') {
        return;
      }

      try {
        console.log('[WIZARD-CONTAINER] Iniciando inicialização - Tentativa', retryCount + 1);
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
          return; // Sair e aguardar próxima execução
        }

        // Inicializar dados limpos
        if (!isCancelled) {
          await initializeCleanData();
          setInitializationState('ready');
          setRetryCount(0); // Reset counter on success
          
          console.log('[WIZARD-CONTAINER] Inicialização concluída com sucesso:', {
            hasToken: !!inviteToken,
            memberType: cleanData.memberType,
            email: cleanData.email,
            name: cleanData.name
          });
        }
      } catch (error) {
        console.error('[WIZARD-CONTAINER] Erro na inicialização:', error);
        
        if (!isCancelled) {
          if (retryCount < maxRetries) {
            console.warn(`[WIZARD-CONTAINER] Tentando novamente em 1s (${retryCount + 1}/${maxRetries})`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              if (!isCancelled) {
                setInitializationState('idle'); // Trigger retry
              }
            }, 1000);
          } else {
            console.error('[WIZARD-CONTAINER] Máximo de tentativas atingido');
            setInitializationState('error');
          }
        }
      }
    };

    initializeOnboarding();

    return () => {
      isCancelled = true;
    };
  }, [inviteToken, isInviteLoading, initializationState, initializeCleanData, cleanupForInvite, retryCount, maxRetries, cleanData.memberType, cleanData.email, cleanData.name]);

  // Estado de loading melhorado e mais preciso
  const isLoading = useMemo(() => {
    // Estados que indicam loading
    if (initializationState === 'loading' || initializationState === 'idle') {
      return true;
    }
    
    // Se tem token e ainda está carregando convite
    if (inviteToken && isInviteLoading) {
      return true;
    }
    
    // Se já deu erro, não está mais loading
    if (initializationState === 'error') {
      return false;
    }
    
    // Verificar se tem dados mínimos necessários
    const hasMinimalData = cleanData.memberType && (cleanData.email || cleanData.name);
    if (!hasMinimalData && initializationState !== 'ready') {
      return true;
    }
    
    return false;
  }, [initializationState, inviteToken, isInviteLoading, cleanData]);

  // Memoizar updateData para evitar re-criação
  const memoizedUpdateData = useCallback((newData: any) => {
    // Preservar token nos dados se presente
    const dataWithToken = inviteToken ? { ...newData, inviteToken } : newData;
    updateData(dataWithToken);
  }, [updateData, inviteToken]);

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  // Estado de erro com opção de retry
  if (initializationState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <h2 className="text-xl font-semibold mb-2">Erro na Inicialização</h2>
          <p className="text-neutral-300 mb-4">
            Não foi possível carregar os dados do onboarding após {maxRetries} tentativas.
          </p>
          <button 
            onClick={() => {
              setRetryCount(0);
              setInitializationState('idle');
            }}
            className="px-4 py-2 bg-viverblue rounded text-white hover:bg-viverblue/90 transition-colors"
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
