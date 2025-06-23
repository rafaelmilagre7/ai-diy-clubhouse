
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboardingWizard } from '../hooks/useOnboardingWizard';
import { useCleanOnboardingData } from '../hooks/useCleanOnboardingData';
import { useInviteCleanup } from '@/hooks/useInviteCleanup';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [containerError, setContainerError] = useState<string | null>(null);
  
  const { cleanupForInvite } = useInviteCleanup();
  
  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  // Memoizar o memberType para evitar re-renders
  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // Inicialização única e controlada
  useEffect(() => {
    if (isInitialized) return;

    const setupOnboarding = async () => {
      try {
        setIsInitialized(true);
        
        if (inviteToken) {
          console.log('[WIZARD-CONTAINER] Convite detectado - limpeza seletiva');
          
          // Limpeza seletiva apenas do localStorage, sem deletar dados do banco
          const storageKeys = [
            'viver-ia-onboarding-data',
            'onboarding-wizard-step'
          ];

          storageKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log('[WIZARD-CONTAINER] Removido do storage:', key);
          });

          // Aguardar carregamento dos dados do convite se necessário
          if (!isInviteLoading) {
            initializeCleanData();
          }
        } else {
          // Sem convite, inicializar normalmente
          initializeCleanData();
        }
      } catch (error: any) {
        console.error('[WIZARD-CONTAINER] Erro na configuração:', error);
        setContainerError(`Erro na inicialização: ${error.message}`);
      }
    };

    setupOnboarding();
  }, [inviteToken, isInitialized, isInviteLoading, initializeCleanData]);

  // Inicializar dados quando convite carrega
  useEffect(() => {
    if (inviteToken && !isInviteLoading && isInitialized && Object.keys(cleanData).length <= 2) {
      console.log('[WIZARD-CONTAINER] Inicializando dados após carregamento do convite');
      initializeCleanData();
    }
  }, [inviteToken, isInviteLoading, isInitialized, cleanData, initializeCleanData]);

  // Estado de loading melhorado
  const isLoading = useMemo(() => {
    // Se é convite e ainda está carregando detalhes
    if (inviteToken && isInviteLoading) return true;
    
    // Se ainda não inicializou
    if (!isInitialized) return true;
    
    // Se é convite mas dados ainda não foram carregados
    if (inviteToken && Object.keys(cleanData).length <= 2) return true;
    
    // Para usuários normais
    if (!inviteToken && Object.keys(cleanData).length <= 1) return true;
    
    return false;
  }, [inviteToken, isInviteLoading, isInitialized, cleanData]);

  // Memoizar updateData para evitar re-criação
  const memoizedUpdateData = useCallback((newData: any) => {
    updateData(newData);
  }, [updateData]);

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  // Incorporar erro do container
  const enhancedProps = useMemo(() => ({
    ...wizardProps,
    completionError: containerError || wizardProps.completionError
  }), [wizardProps, containerError]);

  return (
    <>
      {children({
        ...enhancedProps,
        data: cleanData,
        memberType,
        isLoading
      })}
    </>
  );
};
