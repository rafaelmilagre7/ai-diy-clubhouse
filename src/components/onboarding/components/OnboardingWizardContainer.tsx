
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
  
  // Token ÚNICO - fonte única de verdade (pode ser null)
  const inviteToken = useMemo(() => {
    return InviteTokenManager.getToken();
  }, [searchParams]);

  console.log('[WIZARD-CONTAINER] Token de convite:', {
    hasToken: !!inviteToken,
    tokenPreview: inviteToken ? inviteToken.substring(0, 8) + '***' : 'nenhum'
  });

  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // Inicialização SIMPLES
  useEffect(() => {
    console.log('[WIZARD-CONTAINER] Inicialização:', {
      hasToken: !!inviteToken,
      memberType,
      hasEmail: !!cleanData.email
    });
    
    if (inviteToken) {
      InviteTokenManager.storeToken(inviteToken);
      cleanupForInvite();
    }

    initializeCleanData();
  }, [inviteToken, initializeCleanData, cleanupForInvite]);

  // Loading CRÍTICO: só para convites pendentes
  const isLoading = useMemo(() => {
    const shouldLoad = inviteToken && isInviteLoading && !cleanData.email;
    console.log('[WIZARD-CONTAINER] Loading status:', {
      inviteToken: !!inviteToken,
      isInviteLoading,
      hasEmail: !!cleanData.email,
      shouldLoad
    });
    return shouldLoad;
  }, [inviteToken, isInviteLoading, cleanData.email]);

  const memoizedUpdateData = useCallback((newData: any) => {
    const dataWithToken = inviteToken ? { ...newData, inviteToken } : newData;
    updateData(dataWithToken);
  }, [updateData, inviteToken]);

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  console.log('[WIZARD-CONTAINER] Renderizando com dados:', {
    memberType,
    isLoading,
    hasData: Object.keys(cleanData).length > 2,
    dataKeys: Object.keys(cleanData)
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
