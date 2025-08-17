/**
 * CRIPTOGRAFIA REAL PARA TOKENS - AES-256-GCM
 * 
 * Substitui tokenEncryption.ts que usava apenas base64
 * Esta implementação usa criptografia AES real através da Web Crypto API
 */

import { realCryptography } from '@/utils/security/realCryptography';
import { logger } from '@/utils/logger';

/**
 * Interface para armazenamento seguro de tokens
 */
interface SecureTokenStorage {
  /**
   * Armazena um token de forma realmente segura
   * @param key Nome da chave para armazenar
   * @param value Token a ser armazenado
   * @param userId ID do usuário para derivar chave de criptografia
   */
  setItem: (key: string, value: any, userId: string) => Promise<boolean>;
  
  /**
   * Recupera um token armazenado de forma segura
   * @param key Nome da chave para recuperar
   * @param userId ID do usuário para derivar chave de criptografia
   */
  getItem: (key: string, userId: string) => Promise<any>;
  
  /**
   * Remove um token do armazenamento
   * @param key Nome da chave para remover
   */
  removeItem: (key: string) => void;
  
  /**
   * Migra dados da criptografia falsa (base64) para AES real
   * @param key Chave do dado a migrar
   * @param userId ID do usuário
   */
  migrateFromFakeEncryption: (key: string, userId: string) => Promise<boolean>;
  
  /**
   * Detecta se existem dados não-criptografados no localStorage
   */
  detectInsecureData: () => string[];
}

/**
 * Detecta dados que ainda usam criptografia falsa (base64)
 */
const detectFakeEncryptedData = (): string[] => {
  const insecureKeys: string[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      const value = localStorage.getItem(key);
      if (!value) continue;
      
      // Detectar padrões de base64 simples (não AES)
      if (value.match(/^[A-Za-z0-9+/]+=*$/) && value.length < 500 && value.includes(':')) {
        try {
          const decoded = atob(value);
          // Se contém padrões de criptografia falsa
          if (decoded.includes('-') && decoded.includes(':')) {
            insecureKeys.push(key);
          }
        } catch {
          // Ignorar se não é base64 válido
        }
      }
    }
  } catch (error) {
    logger.error("Erro ao detectar dados inseguros", {
      component: 'SECURE_TOKEN_STORAGE',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
  
  return insecureKeys;
};

/**
 * Implementação do armazenamento seguro real
 */
export const secureTokenStorage: SecureTokenStorage = {
  
  async setItem(key: string, value: any, userId: string): Promise<boolean> {
    try {
      // Verificar se ambiente suporta criptografia real
      if (!realCryptography.isSecureEnvironment()) {
        logger.error("❌ AMBIENTE INSEGURO - Criptografia não disponível", {
          component: 'SECURE_TOKEN_STORAGE',
          protocol: window.location.protocol,
          webCrypto: typeof crypto?.subtle !== 'undefined'
        });
        return false;
      }
      
      // Criptografar com AES-256-GCM REAL
      const encrypted = await realCryptography.encryptData(value, userId);
      localStorage.setItem(key, encrypted);
      
      logger.info("✅ Token armazenado com criptografia AES-256-GCM", {
        component: 'SECURE_TOKEN_STORAGE',
        key: key,
        encryption: 'AES-256-GCM',
        dataType: typeof value
      });
      
      return true;
    } catch (error) {
      logger.error("❌ Erro ao armazenar token com criptografia real", {
        component: 'SECURE_TOKEN_STORAGE',
        key,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return false;
    }
  },

  async getItem(key: string, userId: string): Promise<any> {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      // Verificar se ambiente suporta criptografia real
      if (!realCryptography.isSecureEnvironment()) {
        logger.error("❌ AMBIENTE INSEGURO - Não é possível descriptografar", {
          component: 'SECURE_TOKEN_STORAGE',
          key
        });
        return null;
      }
      
      // Descriptografar com AES-256-GCM
      const decrypted = await realCryptography.decryptData(stored, userId);
      
      if (decrypted !== null) {
        logger.info("✅ Token recuperado com criptografia AES", {
          component: 'SECURE_TOKEN_STORAGE',
          key: key,
          encryption: 'AES-256-GCM'
        });
      }
      
      return decrypted;
    } catch (error) {
      logger.error("❌ Erro ao recuperar token criptografado", {
        component: 'SECURE_TOKEN_STORAGE',
        key,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      // Tentar migração automática se falhar
      const migrated = await secureTokenStorage.migrateFromFakeEncryption(key, userId);
      if (migrated) {
        return await secureTokenStorage.getItem(key, userId);
      }
      
      return null;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      logger.info("Token removido do armazenamento", {
        component: 'SECURE_TOKEN_STORAGE',
        key
      });
    } catch (error) {
      logger.error("Erro ao remover token", {
        component: 'SECURE_TOKEN_STORAGE',
        key,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async migrateFromFakeEncryption(key: string, userId: string): Promise<boolean> {
    try {
      const oldData = localStorage.getItem(key);
      if (!oldData) return false;
      
      logger.warn("🔄 Migrando dados da criptografia FALSA para AES real", {
        component: 'SECURE_TOKEN_STORAGE',
        key,
        security: 'UPGRADE_FROM_INSECURE'
      });
      
      // Tentar decodificar a ofuscação antiga
      const migrated = await realCryptography.migrateFromFakeEncryption(oldData, userId);
      
      // Salvar com criptografia real
      localStorage.setItem(key, migrated);
      
      logger.info("✅ Migração concluída - dados agora protegidos com AES-256-GCM", {
        component: 'SECURE_TOKEN_STORAGE',
        key,
        from: 'base64_obfuscation',
        to: 'AES-256-GCM'
      });
      
      return true;
    } catch (error) {
      logger.error("❌ Falha na migração de criptografia falsa", {
        component: 'SECURE_TOKEN_STORAGE',
        key,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        security: 'MIGRATION_FAILED'
      });
      return false;
    }
  },

  detectInsecureData(): string[] {
    const insecureKeys = detectFakeEncryptedData();
    
    if (insecureKeys.length > 0) {
      logger.warn("🚨 DADOS INSEGUROS DETECTADOS no localStorage", {
        component: 'SECURE_TOKEN_STORAGE',
        insecureKeys,
        count: insecureKeys.length,
        security: 'VULNERABILITY_DETECTED',
        recommendation: 'Execute migração imediata para AES-256-GCM'
      });
      
      console.warn(`
🚨 VULNERABILIDADE DE SEGURANÇA DETECTADA 🚨

Encontrados ${insecureKeys.length} itens com criptografia FALSA (apenas base64):
${insecureKeys.map(k => `  • ${k}`).join('\n')}

⚠️  RISCO: Estes dados podem ser facilmente decodificados por qualquer atacante.
✅  SOLUÇÃO: A migração automática para AES-256-GCM será executada.

Para forçar migração imediata de uma chave específica:
  secureTokenStorage.migrateFromFakeEncryption('chave', 'userId')
      `);
    }
    
    return insecureKeys;
  }
};

// Detectar dados inseguros na inicialização
if (typeof window !== 'undefined') {
  setTimeout(() => {
    secureTokenStorage.detectInsecureData();
  }, 1000);
}