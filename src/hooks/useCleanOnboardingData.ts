
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
  // Campos de controle para readonly
  isNameFromInvite?: boolean;
  isEmailFromInvite?: boolean;
  isPhoneFromInvite?: boolean;
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
  memberType: 'club',
  isNameFromInvite: false,
  isEmailFromInvite: false,
  isPhoneFromInvite: false
});

export const useCleanOnboardingData = (inviteToken?: string): UseCleanOnboardingDataResult => {
  const [data, setData] = useState<OnboardingData>(getInitialData);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const { inviteDetails, isLoading: isInviteLoading, error: inviteError } = useInviteFlow(inviteToken);

  // INICIALIZAÇÃO ROBUSTA com pré-preenchimento de dados do convite
  const initializeCleanData = useCallback(() => {
    if (hasInitialized) return;
    
    const startTime = Date.now();
    logger.info('[CLEAN-DATA] 🚀 Inicializando dados com PRÉ-PREENCHIMENTO:', {
      hasToken: !!inviteToken,
      hasDetails: !!inviteDetails,
      timestamp: new Date().toISOString()
    });

    try {
      if (inviteToken && inviteDetails) {
        // PRÉ-PREENCHIMENTO: Dados do convite disponíveis
        const memberType = inviteDetails.role.name.toLowerCase().includes('formacao') ? 'formacao' : 'club';
        
        const inviteData: OnboardingData = {
          ...getInitialData(),
          // CAMPOS CRÍTICOS PRÉ-PREENCHIDOS
          email: inviteDetails.email,
          name: inviteDetails.name || '',
          phone: inviteDetails.whatsapp_number || '',
          memberType,
          inviteToken,
          // CONTROLE DE READONLY
          isEmailFromInvite: true, // E-mail sempre vem do convite
          isNameFromInvite: !!inviteDetails.name,
          isPhoneFromInvite: !!inviteDetails.whatsapp_number
        };

        logger.info('[CLEAN-DATA] ✅ Dados PRÉ-PREENCHIDOS do convite:', {
          email: inviteDetails.email,
          hasName: !!inviteDetails.name,
          hasPhone: !!inviteDetails.whatsapp_number,
          memberType,
          duration: `${Date.now() - startTime}ms`
        });

        setData(inviteData);
      } else if (inviteToken && inviteError) {
        // Erro na validação - dados básicos apenas
        logger.warn('[CLEAN-DATA] ⚠️ Erro no convite - dados básicos:', {
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

    } catch (error) {
      logger.error('[CLEAN-DATA] ❌ Erro na inicialização:', error);
      setData(getInitialData());
      setHasInitialized(true);
    }
  }, [inviteToken, inviteDetails, inviteError, hasInitialized]);

  // Auto-inicializar quando dados estão prontos
  useEffect(() => {
    if (!hasInitialized && (!isInviteLoading || inviteError)) {
      initializeCleanData();
    }
  }, [isInviteLoading, inviteError, hasInitialized, initializeCleanData]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    // VALIDAÇÃO: Impedir alteração de campos críticos do convite
    const filteredData = { ...newData };
    
    if (data.isEmailFromInvite && newData.email && newData.email !== data.email) {
      logger.warn('[CLEAN-DATA] ⚠️ Tentativa de alterar e-mail do convite bloqueada:', {
        originalEmail: data.email,
        attemptedEmail: newData.email
      });
      delete filteredData.email;
    }
    
    if (data.isNameFromInvite && newData.name && newData.name !== data.name) {
      logger.warn('[CLEAN-DATA] ⚠️ Tentativa de alterar nome do convite bloqueada:', {
        originalName: data.name,
        attemptedName: newData.name
      });
      delete filteredData.name;
    }
    
    if (data.isPhoneFromInvite && newData.phone && newData.phone !== data.phone) {
      logger.warn('[CLEAN-DATA] ⚠️ Tentativa de alterar telefone do convite bloqueada:', {
        originalPhone: data.phone,
        attemptedPhone: newData.phone
      });
      delete filteredData.phone;
    }
    
    logger.info('[CLEAN-DATA] 📝 Atualizando dados (com proteção):', {
      fields: Object.keys(filteredData),
      hasToken: !!inviteToken
    });
    
    setData(prev => ({ ...prev, ...filteredData }));
  }, [inviteToken, data.email, data.name, data.phone, data.isEmailFromInvite, data.isNameFromInvite, data.isPhoneFromInvite]);

  return {
    data,
    updateData,
    initializeCleanData,
    isInviteLoading: isInviteLoading && !hasInitialized
  };
};
