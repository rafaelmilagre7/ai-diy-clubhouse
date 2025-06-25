
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
  
  // Estado controlado com timeout agressivo
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Token único
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
  
  // INICIALIZAÇÃO COM TIMEOUT MÁXIMO DE 500MS
  useEffect(() => {
    if (hasInitialized) return;
    
    const startTime = Date.now();
    logger.info('[WIZARD-CONTAINER] 🚀 Inicializando onboarding CORRIGIDO:', {
      hasToken: !!inviteToken,
      memberType,
      timestamp: new Date().toISOString()
    });
    
    // Determinar se deve mostrar loading
    const shouldShowLoading = !!(inviteToken && isInviteLoading && !cleanData.email);
    
    if (shouldShowLoading) {
      setIsLoading(true);
      
      // TIMEOUT MÁXIMO REDUZIDO: 500ms
      const timeout = setTimeout(() => {
        const duration = Date.now() - startTime;
        logger.warn('[WIZARD-CONTAINER] ⏰ Timeout de 500ms - liberando formulário IMEDIATAMENTE:', {
          duration: `${duration}ms`,
          hasToken: !!inviteToken,
          hasEmail: !!cleanData.email
        });
        setIsLoading(false);
        setHasInitialized(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
    
    // Inicializar imediatamente se sem loading
    try {
      if (inviteToken) {
        InviteTokenManager.storeToken(inviteToken);
        cleanupForInvite();
        logger.info('[WIZARD-CONTAINER] 🔐 Token armazenado e limpeza executada');
      }

      OnboardingCacheManager.clearAll();
      initializeCleanData();
      
      logger.info('[WIZARD-CONTAINER] ✅ Inicialização CORRIGIDA completa:', {
        duration: `${Date.now() - startTime}ms`,
        hasToken: !!inviteToken,
        memberType
      });
      
    } catch (error) {
      logger.error('[WIZARD-CONTAINER] ❌ Erro na inicialização (continuando):', error);
    }
    
    setHasInitialized(true);
    setIsLoading(false);
  }, [inviteToken, isInviteLoading, cleanData.email, hasInitialized, memberType, cleanupForInvite, initializeCleanData]);

  // Parar loading quando dados chegam OU quando erro ocorre
  useEffect(() => {
    if (isLoading && (cleanData.email || !isInviteLoading)) {
      logger.info('[WIZARD-CONTAINER] 📥 Dados recebidos OU erro - parando loading:', {
        hasEmail: !!cleanData.email,
        isInviteLoading
      });
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [cleanData.email, isInviteLoading, isLoading]);

  const memoizedUpdateData = useCallback((newData: any) => {
    logger.info('[WIZARD-CONTAINER] 📝 Atualizando dados:', {
      fields: Object.keys(newData),
      hasToken: !!inviteToken
    });
    const dataWithToken = inviteToken ? { ...newData, inviteToken } : newData;
    updateData(dataWithToken);
  }, [inviteToken, updateData]);

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  logger.info('[WIZARD-CONTAINER] 🎨 Renderizando CORRIGIDO:', {
    memberType,
    isLoading,
    hasInitialized,
    fieldsEnabled: !isLoading,
    dataKeys: Object.keys(cleanData).length,
    maxLoadingTime: '500ms'
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
