
import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboardingWizard } from '../hooks/useOnboardingWizard';
import { useCleanOnboardingData } from '../hooks/useCleanOnboardingData';
import { useOnboardingCleanup } from '../hooks/useOnboardingCleanup';
import { useLoadingTimeoutManager } from '@/hooks/useLoadingTimeoutManager';
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
  
  // Refs para dados estáveis
  const inviteTokenRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const cacheResetRef = useRef(false);
  
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
  
  // CORREÇÃO CRÍTICA: Loading otimizado com timeout automático e promise safety
  const rawIsLoading = useMemo(() => {
    // NUNCA bloquear se não há token de convite
    if (!inviteToken) {
      logger.info('[WIZARD-CONTAINER] Sem token de convite - campos habilitados');
      return false;
    }

    // NUNCA bloquear se já temos email (dados básicos carregados)
    if (cleanData.email) {
      logger.info('[WIZARD-CONTAINER] Dados básicos carregados - campos habilitados');
      return false;
    }

    // Só mostrar loading se realmente está carregando dados de convite
    const shouldLoad = !!(inviteToken && isInviteLoading);
    
    logger.info('[WIZARD-CONTAINER] Status de loading:', {
      inviteToken: !!inviteToken,
      isInviteLoading,
      hasEmail: !!cleanData.email,
      shouldLoad,
      fieldsEnabled: !shouldLoad
    });
    
    return shouldLoad;
  }, [inviteToken, isInviteLoading, cleanData.email]);

  // Timeout manager para forçar desbloqueio
  const { shouldBeUnlocked, isForceUnlocked } = useLoadingTimeoutManager({
    isLoading: rawIsLoading,
    context: 'WizardContainer',
    maxTimeoutMs: 1500, // 1.5 segundos máximo para container
    onForceUnlock: () => {
      logger.error('[WIZARD-CONTAINER] TIMEOUT FORÇADO - habilitando campos imediatamente');
      // Cache reset em caso de timeout
      if (!cacheResetRef.current) {
        OnboardingCacheManager.clearAll();
        cacheResetRef.current = true;
      }
    }
  });

  // LOADING FINAL com fallback agressivo
  const isLoading = rawIsLoading && !shouldBeUnlocked && !isForceUnlocked;

  // Cache reset inicial uma única vez
  useEffect(() => {
    if (!cacheResetRef.current) {
      logger.info('[WIZARD-CONTAINER] Executando cache reset inicial');
      OnboardingCacheManager.clearAll();
      cacheResetRef.current = true;
    }
  }, []);
  
  // Inicialização SIMPLES com proteção contra loops
  useEffect(() => {
    if (isInitializedRef.current) {
      return; // Já foi inicializado
    }
    
    logger.info('[WIZARD-CONTAINER] Inicialização:', {
      hasToken: !!inviteToken,
      memberType,
      hasEmail: !!cleanData.email,
      willEnableFields: !isLoading,
      isForceUnlocked
    });
    
    if (inviteToken) {
      InviteTokenManager.storeToken(inviteToken);
      cleanupForInvite();
    }

    // PROMISE SAFETY: Try-catch em inicialização
    try {
      initializeCleanData();
    } catch (error) {
      logger.error('[WIZARD-CONTAINER] Erro na inicialização - forçando desbloqueio:', error);
      // Em caso de erro, garantir que campos sejam habilitados
    }
    
    isInitializedRef.current = true;
  }, [inviteToken]); // Dependência mínima para evitar loops

  // Callback estável com useRef
  const updateDataRef = useRef(updateData);
  updateDataRef.current = updateData;
  
  const memoizedUpdateData = useCallback((newData: any) => {
    logger.info('[WIZARD-CONTAINER] Atualizando dados:', {
      newData,
      currentlyLoading: isLoading,
      fieldsEnabled: !isLoading,
      isForceUnlocked
    });
    
    try {
      const dataWithToken = inviteToken ? { ...newData, inviteToken } : newData;
      updateDataRef.current(dataWithToken);
    } catch (error) {
      logger.error('[WIZARD-CONTAINER] Erro ao atualizar dados - continuando:', error);
      // Não bloquear em caso de erro de atualização
    }
  }, [inviteToken, isLoading, isForceUnlocked]); // Incluir flags para logs

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  logger.info('[WIZARD-CONTAINER] Renderizando com campos (TIMEOUT PROTECTION):', {
    memberType,
    isLoading,
    rawLoading: rawIsLoading,
    shouldBeUnlocked,
    isForceUnlocked,
    fieldsEnabled: !isLoading,
    hasData: Object.keys(cleanData).length > 2,
    dataKeys: Object.keys(cleanData),
    isInitialized: isInitializedRef.current,
    cacheReset: cacheResetRef.current
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
