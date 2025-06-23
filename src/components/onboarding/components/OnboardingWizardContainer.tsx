
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboardingWizard } from '../hooks/useOnboardingWizard';
import { useCleanOnboardingData } from '../hooks/useCleanOnboardingData';
import { useOnboardingCleanup } from '../hooks/useOnboardingCleanup';

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
  const inviteToken = searchParams.get('token');
  const [initializationState, setInitializationState] = useState<InitializationState>('idle');
  
  const { cleanupForInvite } = useOnboardingCleanup();
  
  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  // Memoizar o memberType para evitar re-renders
  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // Inicialização unificada e otimizada com controle de estado
  useEffect(() => {
    let isCancelled = false;

    const setupOnboarding = async () => {
      try {
        // Evitar execuções duplicadas
        if (initializationState !== 'idle') {
          return;
        }

        console.log('[WIZARD-CONTAINER] Iniciando configuração única');
        setInitializationState('loading');
        
        // Limpeza seletiva apenas se for convite
        if (inviteToken) {
          console.log('[WIZARD-CONTAINER] Convite detectado - executando limpeza');
          cleanupForInvite();
        }

        // Aguardar carregamento do convite se necessário
        if (inviteToken && isInviteLoading) {
          console.log('[WIZARD-CONTAINER] Aguardando carregamento do convite...');
          return; // Esperar próxima execução quando isInviteLoading for false
        }

        if (!isCancelled) {
          await initializeCleanData();
          setInitializationState('ready');
          console.log('[WIZARD-CONTAINER] Configuração concluída com sucesso');
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

  // Estado de loading melhorado com validação robusta
  const isLoading = useMemo(() => {
    // Estados que sempre indicam loading
    if (initializationState === 'loading') return true;
    if (initializationState === 'idle') return true;
    if (inviteToken && isInviteLoading) return true;
    
    // Se houve erro, não está loading mas sim com erro
    if (initializationState === 'error') return false;
    
    // Verificar se tem dados mínimos necessários
    const hasMinimalData = cleanData.memberType && (cleanData.email || cleanData.name);
    
    // Se não tem dados mínimos e não está pronto, ainda está loading
    if (!hasMinimalData && initializationState !== 'ready') return true;
    
    return false;
  }, [initializationState, inviteToken, isInviteLoading, cleanData]);

  // Memoizar updateData para evitar re-criação
  const memoizedUpdateData = useCallback((newData: any) => {
    updateData(newData);
  }, [updateData]);

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
        data: cleanData,
        memberType,
        isLoading
      })}
    </>
  );
};
