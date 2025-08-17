/**
 * Hook para armazenamento com criptografia AES real
 * 
 * Substitui useSecureStorage que usava apenas ofuscação
 */

import { useState, useEffect, useCallback } from 'react';
import { realCryptography } from '@/utils/security/realCryptography';
import { auditLogger } from '@/utils/auditLogger';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface SecureStorageOptions {
  // Tentar migrar dados da ofuscação antiga
  migrateFromLegacy?: boolean;
  // Prefixo personalizado para a chave
  keyPrefix?: string;
}

export const useRealSecureStorage = (
  key: string, 
  defaultValue?: any,
  options: SecureStorageOptions = {}
) => {
  const { user } = useAuth();
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { migrateFromLegacy = false, keyPrefix = 'secure_' } = options;
  const storageKey = `${keyPrefix}${key}`;
  const legacyKey = `secure_${key}`; // Chave da implementação antiga

  // Carregar valor inicial
  useEffect(() => {
    const loadValue = async () => {
      if (!user) {
        setValue(defaultValue);
        setIsLoading(false);
        return;
      }

      // Verificar se o ambiente suporta criptografia real
      if (!realCryptography.isSecureEnvironment()) {
        logger.error("Ambiente não suporta criptografia segura", {
          component: 'REAL_SECURE_STORAGE',
          protocol: window.location.protocol,
          crypto: typeof crypto !== 'undefined',
          subtle: typeof crypto?.subtle !== 'undefined'
        });
        setError('Ambiente inseguro - criptografia não disponível');
        setValue(defaultValue);
        setIsLoading(false);
        return;
      }
      
      try {
        // Tentar carregar dados com criptografia real
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          const decrypted = await realCryptography.decryptData(stored, user.id);
          setValue(decrypted !== null ? decrypted : defaultValue);
          
          logger.info("Dados carregados com criptografia AES", {
            component: 'REAL_SECURE_STORAGE',
            key: storageKey
          });
        } 
        // Se não encontrou dados novos, tentar migração da versão antiga
        else if (migrateFromLegacy) {
          const legacyData = localStorage.getItem(legacyKey);
          
          if (legacyData) {
            logger.warn("Migrando dados da criptografia falsa", {
              component: 'REAL_SECURE_STORAGE',
              legacyKey
            });

            try {
              // Migrar da ofuscação para criptografia real
              const migrated = await realCryptography.migrateFromFakeEncryption(
                legacyData, 
                user.id
              );
              
              // Salvar com criptografia real
              localStorage.setItem(storageKey, migrated);
              
              // Remover dados antigos inseguros
              localStorage.removeItem(legacyKey);
              
              // Decodificar o valor migrado
              const decrypted = await realCryptography.decryptData(migrated, user.id);
              setValue(decrypted !== null ? decrypted : defaultValue);
              
              await auditLogger.logSecurityEvent('data_migration', 'medium', {
                from: 'fake_encryption',
                to: 'aes_gcm',
                key: storageKey
              });
              
              logger.info("Migração de dados concluída com sucesso", {
                component: 'REAL_SECURE_STORAGE',
                key: storageKey,
                from: legacyKey
              });
            } catch (migrationError) {
              logger.error("Erro na migração de dados", {
                component: 'REAL_SECURE_STORAGE',
                error: migrationError instanceof Error ? migrationError.message : 'Erro desconhecido'
              });
              
              // Se migração falhar, usar valor padrão
              setValue(defaultValue);
            }
          } else {
            setValue(defaultValue);
          }
        } else {
          setValue(defaultValue);
        }
      } catch (error) {
        logger.error("Erro ao carregar dados com criptografia real", {
          component: 'REAL_SECURE_STORAGE',
          key: storageKey,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        
        setError(error instanceof Error ? error.message : 'Erro na descriptografia');
        setValue(defaultValue);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadValue();
  }, [user, key, defaultValue, storageKey, legacyKey, migrateFromLegacy]);
  
  // Salvar valor com criptografia AES real
  const setSecureValue = useCallback(async (newValue: any) => {
    if (!user) {
      logger.error("Tentativa de salvar dados sem usuário autenticado", {
        component: 'REAL_SECURE_STORAGE',
        key: storageKey
      });
      setError('Usuário não autenticado');
      return;
    }

    if (!realCryptography.isSecureEnvironment()) {
      logger.error("Ambiente não suporta criptografia segura", {
        component: 'REAL_SECURE_STORAGE',
        key: storageKey
      });
      setError('Ambiente inseguro para criptografia');
      return;
    }
    
    try {
      if (newValue === null || newValue === undefined) {
        localStorage.removeItem(storageKey);
        await auditLogger.logDataEvent('delete', 'secure_storage_aes', key, {
          key: storageKey,
          encryption: 'AES-GCM'
        }, user.id);
      } else {
        const encrypted = await realCryptography.encryptData(newValue, user.id);
        localStorage.setItem(storageKey, encrypted);
        
        await auditLogger.logDataEvent('update', 'secure_storage_aes', key, {
          key: storageKey,
          dataType: typeof newValue,
          encryption: 'AES-256-GCM'
        }, user.id);
      }
      
      setValue(newValue);
      setError(null);
      
      logger.info("Dados salvos com criptografia AES", {
        component: 'REAL_SECURE_STORAGE',
        key: storageKey,
        dataType: typeof newValue,
        encryption: 'AES-256-GCM'
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      logger.error("Erro ao salvar dados com criptografia real", {
        component: 'REAL_SECURE_STORAGE',
        key: storageKey,
        error: errorMessage
      });
      
      setError(errorMessage);
      
      await auditLogger.logSecurityEvent('storage_encryption_error', 'high', {
        key: storageKey,
        operation: 'save',
        error: errorMessage,
        encryption: 'AES-256-GCM'
      });
    }
  }, [user, key, storageKey]);
  
  // Remover valor
  const removeSecureValue = useCallback(async () => {
    await setSecureValue(null);
  }, [setSecureValue]);
  
  // Limpar dados antigos inseguros
  const cleanupLegacyData = useCallback(() => {
    if (localStorage.getItem(legacyKey)) {
      localStorage.removeItem(legacyKey);
      logger.info("Dados legados inseguros removidos", {
        component: 'REAL_SECURE_STORAGE',
        legacyKey
      });
    }
  }, [legacyKey]);
  
  return {
    value,
    setValue: setSecureValue,
    removeValue: removeSecureValue,
    cleanupLegacyData,
    isLoading,
    error,
    isSecureEnvironment: realCryptography.isSecureEnvironment()
  };
};