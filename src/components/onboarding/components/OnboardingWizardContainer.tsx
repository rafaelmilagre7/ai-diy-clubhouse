
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { cleanupForInvite } = useOnboardingCleanup();
  
  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  // Memoizar o memberType para evitar re-renders
  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // Inicialização otimizada
  useEffect(() => {
    if (isInitialized) return;

    const setupOnboarding = async () => {
      try {
        setIsInitialized(true);
        console.log('[WIZARD-CONTAINER] Inicializando onboarding');
        
        // Limpeza seletiva apenas se for convite
        if (inviteToken) {
          console.log('[WIZARD-CONTAINER] Convite detectado - executando limpeza');
          cleanupForInvite();
        }

        // Inicializar dados quando não está carregando convite
        if (!isInviteLoading) {
          initializeCleanData();
        }
      } catch (error: any) {
        console.error('[WIZARD-CONTAINER] Erro na configuração:', error);
      }
    };

    setupOnboarding();
  }, [inviteToken, isInitialized, isInviteLoading, initializeCleanData, cleanupForInvite]);

  // Inicializar dados quando convite carrega
  useEffect(() => {
    if (inviteToken && !isInviteLoading && isInitialized && Object.keys(cleanData).length <= 2) {
      console.log('[WIZARD-CONTAINER] Inicializando dados após carregamento do convite');
      initializeCleanData();
    }
  }, [inviteToken, isInviteLoading, isInitialized, cleanData, initializeCleanData]);

  // Estado de loading otimizado
  const isLoading = useMemo(() => {
    if (inviteToken && isInviteLoading) return true;
    if (!isInitialized) return true;
    if (inviteToken && Object.keys(cleanData).length <= 2) return true;
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
