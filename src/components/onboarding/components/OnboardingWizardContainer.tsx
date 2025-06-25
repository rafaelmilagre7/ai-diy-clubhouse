
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboardingWizard } from '../hooks/useOnboardingWizard';
import { useCleanOnboardingData } from '../hooks/useCleanOnboardingData';
import { useOnboardingCleanup } from '../hooks/useOnboardingCleanup';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { OnboardingCacheManager } from '@/utils/onboardingCacheManager';
import { tokenAudit } from '@/utils/tokenAuditLogger';
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // AUDITORIA COMPLETA DO TOKEN
  const inviteToken = useMemo(() => {
    // Reset auditoria para nova sessão
    tokenAudit.reset();
    
    // 1. Token da URL via useSearchParams
    const urlToken = searchParams.get('token');
    if (urlToken) {
      tokenAudit.logStep('URL_SEARCH_PARAMS', urlToken, 'useSearchParams');
    }
    
    // 2. Token do InviteTokenManager
    const managerToken = InviteTokenManager.getToken();
    if (managerToken) {
      tokenAudit.logStep('INVITE_TOKEN_MANAGER', managerToken, 'localStorage/url');
    }
    
    // 3. Token final escolhido
    const finalToken = urlToken || managerToken;
    if (finalToken) {
      tokenAudit.logStep('FINAL_TOKEN_SELECTED', finalToken, 'final_choice', {
        fromUrl: !!urlToken,
        fromManager: !!managerToken,
        currentUrl: window.location.href,
        searchParamsString: searchParams.toString()
      });
    }
    
    logger.info('[WIZARD-CONTAINER] 🔍 Auditoria de token completa:', {
      urlToken: urlToken?.substring(0, 8) + '***' || 'none',
      managerToken: managerToken?.substring(0, 8) + '***' || 'none',
      finalToken: finalToken?.substring(0, 8) + '***' || 'none',
      currentUrl: window.location.href,
      searchParams: searchParams.toString()
    });
    
    return finalToken;
  }, [searchParams]);

  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isInviteLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // INICIALIZAÇÃO COM AUDITORIA
  useEffect(() => {
    if (hasInitialized) return;
    
    const startTime = Date.now();
    logger.info('[WIZARD-CONTAINER] 🚀 Inicializando onboarding com auditoria COMPLETA:', {
      hasToken: !!inviteToken,
      tokenLength: inviteToken?.length || 0,
      memberType,
      timestamp: new Date().toISOString()
    });
    
    // Log do token no contexto de inicialização
    if (inviteToken) {
      tokenAudit.logStep('INITIALIZATION_START', inviteToken, 'useEffect');
    }
    
    const shouldShowLoading = !!(inviteToken && isInviteLoading && !cleanData.email);
    
    if (shouldShowLoading) {
      setIsLoading(true);
      
      // TIMEOUT MÁXIMO: 500ms
      const timeout = setTimeout(() => {
        const duration = Date.now() - startTime;
        logger.warn('[WIZARD-CONTAINER] ⏰ Timeout de 500ms - liberando formulário:', {
          duration: `${duration}ms`,
          hasToken: !!inviteToken,
          hasEmail: !!cleanData.email,
          auditReport: tokenAudit.generateAuditReport()
        });
        setIsLoading(false);
        setHasInitialized(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
    
    // Inicializar imediatamente se sem loading
    try {
      if (inviteToken) {
        tokenAudit.logStep('TOKEN_STORAGE', inviteToken, 'InviteTokenManager.storeToken');
        InviteTokenManager.storeToken(inviteToken);
        cleanupForInvite();
        logger.info('[WIZARD-CONTAINER] 🔐 Token armazenado e limpeza executada');
      }

      OnboardingCacheManager.clearAll();
      initializeCleanData();
      
      logger.info('[WIZARD-CONTAINER] ✅ Inicialização COMPLETA:', {
        duration: `${Date.now() - startTime}ms`,
        hasToken: !!inviteToken,
        memberType,
        auditSteps: tokenAudit.generateAuditReport().totalSteps
      });
      
    } catch (error) {
      logger.error('[WIZARD-CONTAINER] ❌ Erro na inicialização:', error, {
        auditReport: tokenAudit.generateAuditReport()
      });
    }
    
    setHasInitialized(true);
    setIsLoading(false);
  }, [inviteToken, isInviteLoading, cleanData.email, hasInitialized, memberType, cleanupForInvite, initializeCleanData]);

  // Parar loading quando dados chegam
  useEffect(() => {
    if (isLoading && (cleanData.email || !isInviteLoading)) {
      logger.info('[WIZARD-CONTAINER] 📥 Dados recebidos - parando loading:', {
        hasEmail: !!cleanData.email,
        isInviteLoading,
        auditReport: tokenAudit.generateAuditReport()
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

  logger.info('[WIZARD-CONTAINER] 🎨 Renderizando com auditoria:', {
    memberType,
    isLoading,
    hasInitialized,
    fieldsEnabled: !isLoading,
    dataKeys: Object.keys(cleanData).length,
    auditSteps: tokenAudit.generateAuditReport().totalSteps
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
