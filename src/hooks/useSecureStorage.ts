
import { useState, useEffect, useCallback } from 'react';
import { advancedEncryption } from '@/utils/advancedEncryption';
import { auditLogger } from '@/utils/auditLogger';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

// Hook para armazenamento seguro de dados sensíveis
export const useSecureStorage = (key: string, defaultValue?: any) => {
  const { user } = useAuth();
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar valor inicial
  useEffect(() => {
    const loadValue = async () => {
      if (!user) {
        setValue(defaultValue);
        setIsLoading(false);
        return;
      }
      
      try {
        const stored = localStorage.getItem(`secure_${key}`);
        if (stored) {
          const decrypted = await advancedEncryption.decryptSensitiveData(
            stored, 
            user.id, 
            key
          );
          setValue(decrypted !== null ? decrypted : defaultValue);
        } else {
          setValue(defaultValue);
        }
      } catch (error) {
        logger.warn("Erro ao carregar dados seguros", {
          component: 'SECURE_STORAGE',
          key,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        setValue(defaultValue);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadValue();
  }, [user, key, defaultValue]);
  
  // Salvar valor de forma segura
  const setSecureValue = useCallback(async (newValue: any) => {
    if (!user) {
      logger.warn("Tentativa de salvar dados sem usuário autenticado", {
        component: 'SECURE_STORAGE',
        key
      });
      return;
    }
    
    try {
      if (newValue === null || newValue === undefined) {
        localStorage.removeItem(`secure_${key}`);
        await auditLogger.logDataEvent('delete', 'secure_storage', key, {
          key
        }, user.id);
      } else {
        const encrypted = await advancedEncryption.encryptSensitiveData(
          newValue, 
          user.id, 
          key
        );
        localStorage.setItem(`secure_${key}`, encrypted);
        
        await auditLogger.logDataEvent('update', 'secure_storage', key, {
          key,
          dataType: typeof newValue
        }, user.id);
      }
      
      setValue(newValue);
      
      logger.info("Dados seguros salvos", {
        component: 'SECURE_STORAGE',
        key,
        dataType: typeof newValue
      });
      
    } catch (error) {
      logger.error("Erro ao salvar dados seguros", {
        component: 'SECURE_STORAGE',
        key,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      await auditLogger.logSecurityEvent('storage_error', 'medium', {
        key,
        operation: 'save',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }, [user, key]);
  
  // Remover valor
  const removeSecureValue = useCallback(async () => {
    await setSecureValue(null);
  }, [setSecureValue]);
  
  return {
    value,
    setValue: setSecureValue,
    removeValue: removeSecureValue,
    isLoading
  };
};
