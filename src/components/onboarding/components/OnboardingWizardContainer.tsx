
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboardingWizard } from '../hooks/useOnboardingWizard';
import { useCleanOnboardingData } from '../hooks/useCleanOnboardingData';
import { useOnboardingCleanup } from '../hooks/useOnboardingCleanup';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { OnboardingCacheManager } from '@/utils/onboardingCacheManager';
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
  
  // Estado simplificado - sem refs complexos
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Token ÚNICO - fonte única de verdade
  const inviteToken = useMemo(() => {
    return searchParams.get('token') || InviteTokenManager.getToken();
  }, [searchParams]);

  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // LÓGICA SIMPLIFICADA: Loading máximo de 500ms
  useEffect(() => {
    if (isInitialized) return;
    
    logger.info('[WIZARD-CONTAINER] Inicializando onboarding:', {
      hasToken: !!inviteToken,
      memberType,
      hasEmail: !!cleanData.email
    });
    
    // Mostrar loading apenas se há token E ainda não tem dados básicos
    const shouldLoad = !!(inviteToken && isInviteLoading && !cleanData.email);
    setIsLoading(shouldLoad);
    
    if (shouldLoad) {
      // Timeout agressivo de 500ms
      const timeout = setTimeout(() => {
        logger.warn('[WIZARD-CONTAINER] Timeout de 500ms - desbloqueando campos');
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
    
    // Inicialização simples
    if (inviteToken) {
      InviteTokenManager.storeToken(inviteToken);
      cleanupForInvite();
    }

    // Cache reset uma única vez
    OnboardingCacheManager.clearAll();
    
    // Inicializar dados
    try {
      initializeCleanData();
    } catch (error) {
      logger.error('[WIZARD-CONTAINER] Erro na inicialização - continuando:', error);
    }
    
    setIsInitialized(true);
    setIsLoading(false);
  }, [inviteToken, isInviteLoading, cleanData.email, isInitialized]);

  // Callback estável 
  const memoizedUpdateData = useCallback((newData: any) => {
    logger.info('[WIZARD-CONTAINER] Atualizando dados:', newData);
    const dataWithToken = inviteToken ? { ...newData, inviteToken } : newData;
    updateData(dataWithToken);
  }, [inviteToken, updateData]);

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  logger.info('[WIZARD-CONTAINER] Renderizando (SIMPLIFICADO):', {
    memberType,
    isLoading,
    fieldsEnabled: !isLoading,
    hasData: Object.keys(cleanData).length > 2,
    isInitialized
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
