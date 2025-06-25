
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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // CORREÇÃO CRÍTICA: Loading otimizado com timeout automático
  const isLoading = useMemo(() => {
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

  // Timeout de segurança para loading
  useEffect(() => {
    if (isLoading) {
      logger.info('[WIZARD-CONTAINER] Iniciando timeout de loading (3s)');
      loadingTimeoutRef.current = setTimeout(() => {
        logger.warn('[WIZARD-CONTAINER] TIMEOUT DE LOADING - forçando habilitação dos campos');
        // O timeout será naturalmente resolvido quando isInviteLoading mudar
      }, 3000);
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading]);
  
  // Inicialização SIMPLES com proteção contra loops
  useEffect(() => {
    if (isInitializedRef.current) {
      return; // Já foi inicializado
    }
    
    logger.info('[WIZARD-CONTAINER] Inicialização:', {
      hasToken: !!inviteToken,
      memberType,
      hasEmail: !!cleanData.email,
      willEnableFields: !isLoading
    });
    
    if (inviteToken) {
      InviteTokenManager.storeToken(inviteToken);
      cleanupForInvite();
    }

    initializeCleanData();
    isInitializedRef.current = true;
  }, [inviteToken]); // Dependência mínima para evitar loops

  // Callback estável com useRef
  const updateDataRef = useRef(updateData);
  updateDataRef.current = updateData;
  
  const memoizedUpdateData = useCallback((newData: any) => {
    logger.info('[WIZARD-CONTAINER] Atualizando dados:', {
      newData,
      currentlyLoading: isLoading,
      fieldsEnabled: !isLoading
    });
    
    const dataWithToken = inviteToken ? { ...newData, inviteToken } : newData;
    updateDataRef.current(dataWithToken);
  }, [inviteToken, isLoading]); // Incluir isLoading para logs

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  logger.info('[WIZARD-CONTAINER] Renderizando com campos:', {
    memberType,
    isLoading,
    fieldsEnabled: !isLoading,
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
