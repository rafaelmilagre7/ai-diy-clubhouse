
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
  isNameFromInvite?: boolean;
  isEmailFromInvite?: boolean;
  isPhoneFromInvite?: boolean;
}

interface UseCleanOnboardingDataResult {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  initializeCleanData: () => void;
  isLoading: boolean;
}

const getInitialData = (): OnboardingData => ({
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  experienceLevel: 'iniciante',
  mainObjective: '',
  memberType: 'club',
  isNameFromInvite: false,
  isEmailFromInvite: false,
  isPhoneFromInvite: false
});

export const useCleanOnboardingData = (inviteToken?: string): UseCleanOnboardingDataResult => {
  const [data, setData] = useState<OnboardingData>(getInitialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const { inviteDetails, isLoading: isInviteLoading, error: inviteError } = useInviteFlow(inviteToken);

  // TIMEOUT FAILSAFE: SEMPRE libera após 3 segundos
  useEffect(() => {
    if (isLoading) {
      const failsafeTimeout = setTimeout(() => {
        logger.warn('[CLEAN-DATA] ⏰ FAILSAFE: Liberando formulário após 3 segundos:', {
          hasToken: !!inviteToken,
          hasDetails: !!inviteDetails,
          inviteError: !!inviteError
        });
        setIsLoading(false);
        setHasInitialized(true);
      }, 3000);

      return () => clearTimeout(failsafeTimeout);
    }
  }, [isLoading, inviteToken, inviteDetails, inviteError]);

  const initializeCleanData = useCallback(() => {
    if (hasInitialized) {
      logger.info('[CLEAN-DATA] Já inicializado - ignorando');
      return;
    }
    
    const startTime = Date.now();
    logger.info('[CLEAN-DATA] 🚀 INICIANDO inicialização robusta:', {
      hasToken: !!inviteToken,
      tokenLength: inviteToken?.length || 0,
      hasDetails: !!inviteDetails,
      isInviteLoading,
      inviteError: !!inviteError,
      timestamp: new Date().toISOString()
    });

    try {
      // CASO 1: Token válido COM dados do convite
      if (inviteToken && inviteDetails && !inviteError) {
        const memberType = inviteDetails.role.name.toLowerCase().includes('formacao') ? 'formacao' : 'club';
        
        const inviteData: OnboardingData = {
          ...getInitialData(),
          email: inviteDetails.email,
          name: inviteDetails.name || '',
          phone: inviteDetails.whatsapp_number || '',
          memberType,
          inviteToken,
          isEmailFromInvite: true,
          isNameFromInvite: !!inviteDetails.name,
          isPhoneFromInvite: !!inviteDetails.whatsapp_number
        };

        logger.info('[CLEAN-DATA] ✅ PRÉ-PREENCHIMENTO com dados do convite:', {
          email: inviteDetails.email,
          hasName: !!inviteDetails.name,
          hasPhone: !!inviteDetails.whatsapp_number,
          memberType,
          duration: `${Date.now() - startTime}ms`
        });

        setData(inviteData);
        setHasInitialized(true);
        return;
      }

      // CASO 2: Token com erro OU sem dados - formulário normal
      if (inviteToken && (inviteError || !inviteDetails)) {
        logger.warn('[CLEAN-DATA] ⚠️ Convite com problema - formulário normal:', {
          error: inviteError,
          hasDetails: !!inviteDetails,
          token: inviteToken?.substring(0, 8) + '***'
        });

        setData({
          ...getInitialData(),
          inviteToken
        });
        setHasInitialized(true);
        return;
      }

      // CASO 3: Sem token - modo normal
      logger.info('[CLEAN-DATA] 👤 Modo normal (sem convite)');
      setData(getInitialData());
      setHasInitialized(true);

    } catch (error) {
      logger.error('[CLEAN-DATA] ❌ Erro na inicialização - fallback:', error);
      setData(getInitialData());
      setHasInitialized(true);
    }
  }, [inviteToken, inviteDetails, inviteError, hasInitialized]);

  // INICIALIZAÇÃO AUTOMÁTICA com lógica robusta
  useEffect(() => {
    if (hasInitialized) return;

    // Se há token mas ainda está carregando, aguardar UM POUCO
    if (inviteToken && isInviteLoading && !inviteError) {
      if (!isLoading) {
        logger.info('[CLEAN-DATA] 🔄 Aguardando dados do convite (máx 3s)...');
        setIsLoading(true);
      }
      return;
    }

    // Se não há token OU loading terminou (com sucesso ou erro), inicializar
    logger.info('[CLEAN-DATA] 🎯 Condições atendidas - inicializando:', {
      hasToken: !!inviteToken,
      isInviteLoading,
      hasError: !!inviteError,
      hasDetails: !!inviteDetails
    });
    
    initializeCleanData();
    setIsLoading(false);
  }, [inviteToken, isInviteLoading, inviteError, inviteDetails, hasInitialized, initializeCleanData, isLoading]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    // Validação: Impedir alteração de campos protegidos
    const filteredData = { ...newData };
    
    if (data.isEmailFromInvite && newData.email && newData.email !== data.email) {
      logger.warn('[CLEAN-DATA] ⚠️ Bloqueando alteração de e-mail do convite');
      delete filteredData.email;
    }
    
    if (data.isNameFromInvite && newData.name && newData.name !== data.name) {
      logger.warn('[CLEAN-DATA] ⚠️ Bloqueando alteração de nome do convite');
      delete filteredData.name;
    }
    
    if (data.isPhoneFromInvite && newData.phone && newData.phone !== data.phone) {
      logger.warn('[CLEAN-DATA] ⚠️ Bloqueando alteração de telefone do convite');
      delete filteredData.phone;
    }
    
    logger.info('[CLEAN-DATA] 📝 Atualizando dados:', {
      fields: Object.keys(filteredData)
    });
    
    setData(prev => ({ ...prev, ...filteredData }));
  }, [data.email, data.name, data.phone, data.isEmailFromInvite, data.isNameFromInvite, data.isPhoneFromInvite]);

  return {
    data,
    updateData,
    initializeCleanData,
    isLoading: isLoading && !hasInitialized // Só mostra loading se não inicializou ainda
  };
};
