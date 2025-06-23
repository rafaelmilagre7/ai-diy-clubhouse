
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
  
  // Token ÚNICO - fonte única de verdade
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
  
  // Inicialização SIMPLES sem estados complexos
  useEffect(() => {
    console.log('[WIZARD-CONTAINER] Inicialização simples');
    
    if (inviteToken) {
      InviteTokenManager.storeToken(inviteToken);
      cleanupForInvite();
    }

    initializeCleanData();
  }, [inviteToken, initializeCleanData, cleanupForInvite]);

  // Loading SIMPLIFICADO
  const isLoading = useMemo(() => {
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
