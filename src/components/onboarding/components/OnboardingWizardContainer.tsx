
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
  
  // Token simples: URL ou storage, sem fallbacks múltiplos
  const inviteToken = useMemo(() => {
    return searchParams.get('token') || InviteTokenManager.getStoredToken();
  }, [searchParams]);

  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // Inicialização simples - sem estados complexos
  useEffect(() => {
    const setupOnboarding = async () => {
      console.log('[WIZARD-CONTAINER] Configurando onboarding');
      
      if (inviteToken) {
        InviteTokenManager.storeToken(inviteToken);
        cleanupForInvite();
      }

      // Aguardar carregamento do convite apenas se necessário
      if (inviteToken && isInviteLoading) {
        return;
      }

      await initializeCleanData();
      console.log('[WIZARD-CONTAINER] Configuração concluída');
    };

    setupOnboarding();
  }, [inviteToken, isInviteLoading, initializeCleanData, cleanupForInvite]);

  // Loading simples - sem estados de erro complexos
  const isLoading = useMemo(() => {
    if (inviteToken && isInviteLoading) return true;
    return !cleanData.memberType || (!cleanData.email && !cleanData.name);
  }, [inviteToken, isInviteLoading, cleanData]);

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
