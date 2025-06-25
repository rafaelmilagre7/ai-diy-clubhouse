
import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboardingWizard } from '../hooks/useOnboardingWizard';
import { useCleanOnboardingData } from '../hooks/useCleanOnboardingData';
import { useOnboardingCleanup } from '../hooks/useOnboardingCleanup';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { logger } from '@/utils/logger';

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
  
  // Refs para dados estáveis
  const inviteTokenRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  
  // Token ÚNICO - fonte única de verdade (estável)
  const inviteToken = useMemo(() => {
    const token = InviteTokenManager.getToken();
    if (token !== inviteTokenRef.current) {
      inviteTokenRef.current = token;
    }
    return inviteTokenRef.current;
  }, [searchParams.get('token')]); // Dependência específica para mudanças de URL

  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // Inicialização SIMPLES com proteção contra loops
  useEffect(() => {
    if (isInitializedRef.current) {
      return; // Já foi inicializado
    }
    
    logger.info('[WIZARD-CONTAINER] Inicialização:', {
      hasToken: !!inviteToken,
      memberType,
      hasEmail: !!cleanData.email
    });
    
    if (inviteToken) {
      InviteTokenManager.storeToken(inviteToken);
      cleanupForInvite();
    }

    initializeCleanData();
    isInitializedRef.current = true;
  }, [inviteToken]); // Dependência mínima para evitar loops

  // Loading CRÍTICO: só para convites pendentes
  const isLoading = useMemo(() => {
    const shouldLoad = !!(inviteToken && isInviteLoading && !cleanData.email);
    logger.info('[WIZARD-CONTAINER] Loading status:', {
      inviteToken: !!inviteToken,
      isInviteLoading,
      hasEmail: !!cleanData.email,
      shouldLoad
    });
    return shouldLoad;
  }, [inviteToken, isInviteLoading, cleanData.email]);

  // Callback estável com useRef
  const updateDataRef = useRef(updateData);
  updateDataRef.current = updateData;
  
  const memoizedUpdateData = useCallback((newData: any) => {
    const dataWithToken = inviteToken ? { ...newData, inviteToken } : newData;
    updateDataRef.current(dataWithToken);
  }, [inviteToken]); // Dependência mínima

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  logger.info('[WIZARD-CONTAINER] Renderizando com dados:', {
    memberType,
    isLoading,
    hasData: Object.keys(cleanData).length > 2,
    dataKeys: Object.keys(cleanData),
    isInitialized: isInitializedRef.current
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
