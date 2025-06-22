
import React from 'react';
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
  const { cleanupForInvite } = useInviteCleanup();
  
  const {
    data: cleanData,
    updateData,
    initializeCleanData
  } = useCleanOnboardingData(inviteToken || undefined);

  // Executar limpeza ANTES de qualquer inicialização
  useEffect(() => {
    const setupForInvite = async () => {
      if (inviteToken) {
        console.log('[WIZARD-CONTAINER] Detectado convite - executando limpeza TOTAL primeiro');
        
        // Primeiro: limpeza total
        await cleanupForInvite(inviteToken);
        
        // Aguardar um pouco para garantir que limpeza foi concluída
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
    };

    setupForInvite();
  }, [inviteToken, cleanupForInvite, initializeCleanData]);

  const memberType = cleanData.memberType || 'club';
  
  // Para convites, aguardar limpeza completa + dados devem estar vazios
  const isLoading = inviteToken 
    ? (!isCleanupComplete || Object.keys(cleanData).length <= 3) // Apenas memberType, startedAt, fromInvite
    : Object.keys(cleanData).length <= 1;

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: updateData,
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
