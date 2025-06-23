
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

export const OnboardingWizardContainer = ({ children }: OnboardingWizardContainerProps) => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  const [initializationState, setInitializationState] = useState<'idle' | 'loading' | 'ready'>('idle');
  
  const { cleanupForInvite } = useOnboardingCleanup();
  
  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  // Memoizar o memberType para evitar re-renders
  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // Inicialização unificada e otimizada
  useEffect(() => {
    let isCancelled = false;

    const setupOnboarding = async () => {
      try {
        console.log('[WIZARD-CONTAINER] Iniciando configuração única');
        
        // Limpeza seletiva apenas se for convite
        if (inviteToken) {
          console.log('[WIZARD-CONTAINER] Convite detectado - executando limpeza');
          cleanupForInvite();
        }

        // Aguardar carregamento do convite se necessário
        if (inviteToken && isInviteLoading) {
          return; // Esperar próxima execução quando isInviteLoading for false
        }

        if (!isCancelled) {
          setInitializationState('loading');
          await initializeCleanData();
          setInitializationState('ready');
        }
      } catch (error) {
        console.error('[WIZARD-CONTAINER] Erro na configuração:', error);
        if (!isCancelled) {
          setInitializationState('ready'); // Prosseguir mesmo com erro
        }
      }
    };

    // Só executar se ainda não foi inicializado
    if (initializationState === 'idle') {
      setupOnboarding();
    }

    return () => {
      isCancelled = true;
    };
  }, [inviteToken, isInviteLoading, initializationState, initializeCleanData, cleanupForInvite]);

  // Estado de loading melhorado
  const isLoading = useMemo(() => {
    if (initializationState === 'loading') return true;
    if (inviteToken && isInviteLoading) return true;
    if (initializationState === 'idle') return true;
    
    // Verificar se tem dados mínimos
    const hasMinimalData = cleanData.memberType && (cleanData.email || cleanData.name);
    return !hasMinimalData;
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
