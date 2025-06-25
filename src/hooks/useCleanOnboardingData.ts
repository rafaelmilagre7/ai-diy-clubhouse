
import { useState, useCallback, useEffect } from 'react';
import { useInviteFlow } from './useInviteFlow';
import { logger } from '@/utils/logger';

interface OnboardingData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  experienceLevel: string;
  mainObjective: string;
  memberType: 'club' | 'formacao';
  inviteToken?: string;
}

interface UseCleanOnboardingDataResult {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  initializeCleanData: () => void;
  isInviteLoading: boolean;
}

const getInitialData = (): OnboardingData => ({
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  experienceLevel: 'iniciante',
  mainObjective: '',
  memberType: 'club'
});

export const useCleanOnboardingData = (inviteToken?: string): UseCleanOnboardingDataResult => {
  const [data, setData] = useState<OnboardingData>(getInitialData);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const { inviteDetails, isLoading: isInviteLoading, error: inviteError } = useInviteFlow(inviteToken);

  // INICIALIZAÇÃO ROBUSTA com timeout de segurança
  const initializeCleanData = useCallback(() => {
    if (hasInitialized) return;
    
    const startTime = Date.now();
    logger.info('[CLEAN-DATA] 🚀 Inicializando dados limpos:', {
      hasToken: !!inviteToken,
      hasDetails: !!inviteDetails,
      timestamp: new Date().toISOString()
    });

    // TIMEOUT DE SEGURANÇA: máximo 2 segundos
    const safetyTimeout = setTimeout(() => {
      if (!hasInitialized) {
        logger.warn('[CLEAN-DATA] ⏰ Timeout de segurança - inicializando com dados vazios', {
          duration: `${Date.now() - startTime}ms`
        });
        setData(getInitialData());
        setHasInitialized(true);
      }
    }, 2000);

    try {
      if (inviteToken && inviteDetails) {
        // Dados do convite disponíveis
        const memberType = inviteDetails.role.name.toLowerCase().includes('formacao') ? 'formacao' : 'club';
        
        const inviteData: OnboardingData = {
          ...getInitialData(),
          email: inviteDetails.email,
          memberType,
          inviteToken
        };

        logger.info('[CLEAN-DATA] ✅ Dados do convite aplicados:', {
          email: inviteDetails.email,
          memberType,
          duration: `${Date.now() - startTime}ms`
        });

        setData(inviteData);
      } else if (inviteToken && inviteError) {
        // Erro na validação - permitir preenchimento manual
        logger.warn('[CLEAN-DATA] ⚠️ Erro no convite - dados manuais:', {
          error: inviteError,
          token: inviteToken?.substring(0, 8) + '***'
        });
        setData({
          ...getInitialData(),
          inviteToken
        });
      } else {
        // Modo normal (sem convite)
        logger.info('[CLEAN-DATA] 👤 Modo normal (sem convite)');
        setData(getInitialData());
      }

      setHasInitialized(true);
      clearTimeout(safetyTimeout);

    } catch (error) {
      logger.error('[CLEAN-DATA] ❌ Erro na inicialização:', error);
      setData(getInitialData());
      setHasInitialized(true);
      clearTimeout(safetyTimeout);
    }
  }, [inviteToken, inviteDetails, inviteError, hasInitialized]);

  // Auto-inicializar quando dados estão prontos ou erro ocorre
  useEffect(() => {
    if (!hasInitialized && (!isInviteLoading || inviteError)) {
      initializeCleanData();
    }
  }, [isInviteLoading, inviteError, hasInitialized, initializeCleanData]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    logger.info('[CLEAN-DATA] 📝 Atualizando dados:', {
      fields: Object.keys(newData),
      hasToken: !!inviteToken
    });
    
    setData(prev => ({ ...prev, ...newData }));
  }, [inviteToken]);

  return {
    data,
    updateData,
    initializeCleanData,
    isInviteLoading: isInviteLoading && !hasInitialized
  };
};
