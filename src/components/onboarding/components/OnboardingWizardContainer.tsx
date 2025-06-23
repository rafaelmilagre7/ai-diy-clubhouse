
import React, { useCallback, useMemo, useEffect } from 'react';
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

export const OnboardingWizardContainer = ({ children }: OnboardingWizardContainerProps) => {
  const [searchParams] = useSearchParams();
  const { cleanupForInvite } = useOnboardingCleanup();
  
  // Token ÚNICO - sem múltiplas fontes
  const inviteToken = useMemo(() => {
    return InviteTokenManager.getToken();
  }, [searchParams]);

  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // Inicialização DIRETA - sem estados intermediários
  useEffect(() => {
    console.log('[WIZARD-CONTAINER] Configuração direta do onboarding');
    
    if (inviteToken) {
      InviteTokenManager.storeToken(inviteToken);
      cleanupForInvite();
    }

    // Inicializar sempre - sem aguardar loading de convite
    initializeCleanData();
    console.log('[WIZARD-CONTAINER] Configuração concluída');
  }, [inviteToken, initializeCleanData, cleanupForInvite]);

  // Loading SIMPLIFICADO - apenas para dados essenciais
  const isLoading = useMemo(() => {
    // Só considerar loading se realmente não tem dados básicos
    return !cleanData.memberType && isInviteLoading;
  }, [cleanData.memberType, isInviteLoading]);

  const memoizedUpdateData = useCallback((newData: any) => {
    const dataWithToken = inviteToken ? { ...newData, inviteToken } : newData;
    updateData(dataWithToken);
  }, [updateData, inviteToken]);

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  return (
    <>
      {children({
        ...wizardProps,
        data: { ...cleanData, inviteToken },
        memberType,
        isLoading
      })}
    </>
  );
};
