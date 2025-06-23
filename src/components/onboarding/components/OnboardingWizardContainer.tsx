
import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboardingWizard } from '../hooks/useOnboardingWizard';
import { useCleanOnboardingData } from '../hooks/useCleanOnboardingData';
import { useInviteCleanup } from '@/hooks/useInviteCleanup';
import { useEffect, useState } from 'react';

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
  const [isCleanupComplete, setIsCleanupComplete] = useState(false);
  const [containerError, setContainerError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const { cleanupForInvite } = useInviteCleanup();
  
  const {
    data: cleanData,
    updateData,
    initializeCleanData
  } = useCleanOnboardingData(inviteToken || undefined);

  // Memoizar o memberType para evitar re-renders
  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // Executar limpeza APENAS UMA VEZ
  useEffect(() => {
    if (hasInitialized) return;

    const setupForInvite = async () => {
      try {
        setHasInitialized(true);
        
        if (inviteToken) {
          console.log('[WIZARD-CONTAINER] Detectado convite - executando limpeza primeiro');
          
          // Limpeza total para convites
          await cleanupForInvite(inviteToken);
          
          // Pequeno delay para garantir limpeza completa
          setTimeout(() => {
            console.log('[WIZARD-CONTAINER] Limpeza concluída, inicializando dados limpos');
            initializeCleanData();
            setIsCleanupComplete(true);
          }, 200);
        } else {
          // Sem convite, inicializar normalmente
          initializeCleanData();
          setIsCleanupComplete(true);
        }
      } catch (error: any) {
        console.error('[WIZARD-CONTAINER] Erro na configuração:', error);
        setContainerError(`Erro na inicialização: ${error.message}`);
        setIsCleanupComplete(true);
      }
    };

    setupForInvite();
  }, [inviteToken, cleanupForInvite, initializeCleanData, hasInitialized]);

  // Determinar estado de loading com lógica mais robusta
  const isLoading = useMemo(() => {
    if (!isCleanupComplete) return true;
    
    if (inviteToken) {
      // Para convites, aguardar dados vazios/limpos
      return Object.keys(cleanData).length <= 3; // Apenas memberType, startedAt, fromInvite
    } else {
      // Para usuários normais, aguardar dados básicos
      return Object.keys(cleanData).length <= 1;
    }
  }, [isCleanupComplete, inviteToken, cleanData]);

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
