/**
 * Hook para armazenamento seguro de tokens com AES-256-GCM
 * 
 * Substitui useSecureStorage e oferece migração automática
 */

import { useState, useEffect, useCallback } from 'react';
import { secureTokenStorage } from '@/utils/secureTokenStorage';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

interface UseSecureTokenStorageOptions {
  // Migrar automaticamente dados antigos inseguros
  autoMigrate?: boolean;
  // Chave personalizada para prefixo
  keyPrefix?: string;
  // Mostrar toast em caso de migração
  showMigrationToast?: boolean;
}

export const useSecureTokenStorage = (
  key: string,
  defaultValue?: any,
  options: UseSecureTokenStorageOptions = {}
) => {
  const { user } = useAuth();
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSecure, setIsSecure] = useState(false);
  
  const { 
    autoMigrate = true, 
    keyPrefix = 'secure_token_',
    showMigrationToast = true 
  } = options;
  
  const storageKey = `${keyPrefix}${key}`;
  
  // Carregar valor inicial
  useEffect(() => {
    const loadValue = async () => {
      if (!user?.id) {
        setValue(defaultValue);
        setIsLoading(false);
        return;
      }
      
      try {
        setError(null);
        
        // Tentar carregar dados seguros
        let loadedValue = await secureTokenStorage.getItem(storageKey, user.id);
        
        // Se não encontrou dados e migração automática ativada
        if (loadedValue === null && autoMigrate) {
          logger.info("Tentando migração automática de dados inseguros", {
            component: 'USE_SECURE_TOKEN_STORAGE',
            key: storageKey
          });
          
          const migrated = await secureTokenStorage.migrateFromFakeEncryption(storageKey, user.id);
          
          if (migrated) {
            loadedValue = await secureTokenStorage.getItem(storageKey, user.id);
            
            if (showMigrationToast) {
              toast({
                title: "🔒 Dados migrados com segurança",
                description: "Seus dados foram automaticamente protegidos com criptografia AES-256-GCM",
              });
            }
            
            logger.info("✅ Migração automática bem-sucedida", {
              component: 'USE_SECURE_TOKEN_STORAGE',
              key: storageKey,
              security: 'AUTO_MIGRATION_SUCCESS'
            });
          }
        }
        
        setValue(loadedValue !== null ? loadedValue : defaultValue);
        setIsSecure(true);
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        
        logger.error("Erro ao carregar token seguro", {
          component: 'USE_SECURE_TOKEN_STORAGE',
          key: storageKey,
          error: errorMsg
        });
        
        setError(errorMsg);
        setValue(defaultValue);
        setIsSecure(false);
        
        toast({
          title: "❌ Erro ao carregar dados seguros",
          description: "Não foi possível carregar os dados criptografados. Usando valores padrão.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadValue();
  }, [user, storageKey, defaultValue, autoMigrate, showMigrationToast]);
  
  // Salvar valor com criptografia real
  const setSecureValue = useCallback(async (newValue: any): Promise<boolean> => {
    if (!user?.id) {
      logger.error("Tentativa de salvar token sem usuário autenticado", {
        component: 'USE_SECURE_TOKEN_STORAGE',
        key: storageKey
      });
      setError('Usuário não autenticado');
      return false;
    }
    
    try {
      setError(null);
      
      if (newValue === null || newValue === undefined) {
        secureTokenStorage.removeItem(storageKey);
        setValue(null);
        return true;
      }
      
      const success = await secureTokenStorage.setItem(storageKey, newValue, user.id);
      
      if (success) {
        setValue(newValue);
        setIsSecure(true);
        
        logger.info("✅ Token salvo com criptografia AES-256-GCM", {
          component: 'USE_SECURE_TOKEN_STORAGE',
          key: storageKey,
          dataType: typeof newValue
        });
        
        return true;
      } else {
        setError('Falha ao criptografar dados');
        setIsSecure(false);
        return false;
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      
      logger.error("❌ Erro ao salvar token seguro", {
        component: 'USE_SECURE_TOKEN_STORAGE',
        key: storageKey,
        error: errorMsg
      });
      
      setError(errorMsg);
      setIsSecure(false);
      
      toast({
        title: "❌ Erro ao salvar dados",
        description: "Não foi possível criptografar e salvar os dados com segurança.",
        variant: "destructive"
      });
      
      return false;
    }
  }, [user, storageKey]);
  
  // Remover valor
  const removeSecureValue = useCallback(async () => {
    return await setSecureValue(null);
  }, [setSecureValue]);
  
  // Forçar migração manual
  const forceMigration = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const migrated = await secureTokenStorage.migrateFromFakeEncryption(storageKey, user.id);
      
      if (migrated) {
        // Recarregar valor migrado
        const newValue = await secureTokenStorage.getItem(storageKey, user.id);
        setValue(newValue);
        setIsSecure(true);
        
        toast({
          title: "✅ Migração concluída",
          description: "Dados migrados para criptografia AES-256-GCM com sucesso!",
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error("Erro na migração forçada", {
        component: 'USE_SECURE_TOKEN_STORAGE',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return false;
    }
  }, [user, storageKey]);
  
  return {
    value,
    setValue: setSecureValue,
    removeValue: removeSecureValue,
    forceMigration,
    isLoading,
    error,
    isSecure,
    storageKey
  };
};