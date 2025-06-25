
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
  
  const [hasSetup, setHasSetup] = useState(false);
  
  // TOKEN AUDIT COMPLETO
  const inviteToken = useMemo(() => {
    tokenAudit.reset();
    
    const urlToken = searchParams.get('token');
    const managerToken = InviteTokenManager.getToken();
    const finalToken = urlToken || managerToken;
    
    if (finalToken) {
      tokenAudit.logStep('FINAL_TOKEN_SELECTED', finalToken, 'OnboardingWizardContainer', {
        fromUrl: !!urlToken,
        fromManager: !!managerToken
      });
    }
    
    logger.info('[WIZARD-CONTAINER] 🔍 Token auditado:', {
      urlToken: urlToken?.substring(0, 8) + '***' || 'none',
      managerToken: managerToken?.substring(0, 8) + '***' || 'none',
      finalToken: finalToken?.substring(0, 8) + '***' || 'none'
    });
    
    return finalToken;
  }, [searchParams]);

  // HOOK PRINCIPAL - useCleanOnboardingData com timeout robusto
  const {
    data: cleanData,
    updateData,
    initializeCleanData,
    isLoading: isDataLoading
  } = useCleanOnboardingData(inviteToken || undefined);

  const memberType = useMemo(() => cleanData.memberType || 'club', [cleanData.memberType]);
  
  // SETUP ÚNICO - executar apenas uma vez
  useEffect(() => {
    if (hasSetup) return;
    
    const startTime = Date.now();
    logger.info('[WIZARD-CONTAINER] 🚀 SETUP ÚNICO iniciado:', {
      hasToken: !!inviteToken,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Limpar caches e estados antigos
      OnboardingCacheManager.clearAll();
      
      // Se há token, armazenar e limpar dados antigos
      if (inviteToken) {
        tokenAudit.logStep('TOKEN_STORAGE', inviteToken, 'InviteTokenManager.storeToken');
        InviteTokenManager.storeToken(inviteToken);
        cleanupForInvite();
        logger.info('[WIZARD-CONTAINER] 🔐 Token armazenado e limpeza executada');
      }

      // Inicializar dados limpos
      initializeCleanData();
      
      logger.info('[WIZARD-CONTAINER] ✅ SETUP ÚNICO concluído:', {
        duration: `${Date.now() - startTime}ms`,
        hasToken: !!inviteToken,
        memberType
      });
      
    } catch (error) {
      logger.error('[WIZARD-CONTAINER] ❌ Erro no setup:', error);
    }
    
    setHasSetup(true);
  }, [inviteToken, hasSetup, cleanupForInvite, initializeCleanData, memberType]);

  const memoizedUpdateData = useCallback((newData: any) => {
    logger.info('[WIZARD-CONTAINER] 📝 Atualizando dados:', {
      fields: Object.keys(newData)
    });
    const dataWithToken = inviteToken ? { ...newData, inviteToken } : newData;
    updateData(dataWithToken);
  }, [inviteToken, updateData]);

  const wizardProps = useOnboardingWizard({
    initialData: cleanData,
    onDataChange: memoizedUpdateData,
    memberType
  });

  // ESTADO FINAL: só mostra loading se realmente necessário E por tempo limitado
  const shouldShowLoading = isDataLoading && !hasSetup;

  logger.info('[WIZARD-CONTAINER] 🎨 Renderizando:', {
    memberType,
    isDataLoading,
    hasSetup,
    shouldShowLoading,
    dataFields: Object.keys(cleanData).length,
    auditSteps: tokenAudit.generateAuditReport().totalSteps
  });

  return (
    <>
      {children({
        ...wizardProps,
        data: { ...cleanData, inviteToken },
        memberType,
        isLoading: shouldShowLoading
      })}
    </>
  );
};
