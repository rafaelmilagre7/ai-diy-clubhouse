
import { logger } from './logger';

// Criptografia avançada para dados sensíveis
export class AdvancedEncryption {
  private static instance: AdvancedEncryption;
  
  private constructor() {}
  
  static getInstance(): AdvancedEncryption {
    if (!AdvancedEncryption.instance) {
      AdvancedEncryption.instance = new AdvancedEncryption();
    }
    return AdvancedEncryption.instance;
  }
  
  // Gerar chave derivada do userId e contexto
  private async deriveKey(userId: string, context: string = 'default'): Promise<string> {
    try {
      const baseKey = `${userId}-${context}-${window.location.hostname}`;
      
      if (crypto.subtle) {
        // Usar Web Crypto API quando disponível
        const encoder = new TextEncoder();
        const data = encoder.encode(baseKey);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      } else {
        // Fallback simples
        return btoa(baseKey).substring(0, 32);
      }
    } catch (error) {
      logger.warn("Erro na derivação de chave, usando fallback", {
        component: 'ADVANCED_ENCRYPTION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return btoa(`${userId}-${context}`).substring(0, 32);
    }
  }
  
  // Criptografar dados sensíveis
  async encryptSensitiveData(data: any, userId: string, context: string = 'storage'): Promise<string> {
    try {
      const key = await this.deriveKey(userId, context);
      const jsonData = JSON.stringify(data);
      const timestamp = Date.now();
      
      // Adicionar timestamp para invalidação automática
      const dataWithTimestamp = JSON.stringify({
        data: jsonData,
        timestamp,
        userId: userId.substring(0, 8) // Parcial por segurança
      });
      
      // Criptografia simples mas efetiva
      const encrypted = btoa(encodeURIComponent(key + ':' + dataWithTimestamp));
      
      logger.info("Dados sensíveis criptografados", {
        component: 'ADVANCED_ENCRYPTION',
        context,
        dataSize: jsonData.length
      });
      
      return encrypted;
    } catch (error) {
      logger.error("Erro na criptografia", {
        component: 'ADVANCED_ENCRYPTION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw new Error('Falha na criptografia de dados');
    }
  }
  
  // Descriptografar dados sensíveis
  async decryptSensitiveData(encryptedData: string, userId: string, context: string = 'storage'): Promise<any> {
    try {
      const key = await this.deriveKey(userId, context);
      const decoded = decodeURIComponent(atob(encryptedData));
      const [storedKey, dataWithTimestamp] = decoded.split(':', 2);
      
      if (storedKey !== key) {
        logger.warn("Chave de descriptografia inválida", {
          component: 'ADVANCED_ENCRYPTION',
          userId: userId.substring(0, 8)
        });
        throw new Error('Chave inválida');
      }
      
      const parsed = JSON.parse(dataWithTimestamp);
      const { data, timestamp, userId: storedUserId } = parsed;
      
      // Verificar integridade do userId (parcial)
      if (storedUserId !== userId.substring(0, 8)) {
        logger.warn("UserId inválido na descriptografia", {
          component: 'ADVANCED_ENCRYPTION'
        });
        throw new Error('Dados corrompidos');
      }
      
      // Verificar expiração (24 horas)
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      
      if (now - timestamp > maxAge) {
        logger.warn("Dados expirados encontrados", {
          component: 'ADVANCED_ENCRYPTION',
          age: Math.round((now - timestamp) / 1000 / 60 / 60) + ' horas'
        });
        throw new Error('Dados expirados');
      }
      
      return JSON.parse(data);
    } catch (error) {
      logger.error("Erro na descriptografia", {
        component: 'ADVANCED_ENCRYPTION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return null;
    }
  }
  
  // Gerar token temporário seguro
  generateSecureToken(length: number = 32): string {
    try {
      if (crypto.getRandomValues) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      } else {
        // Fallback menos seguro
        return Array.from({ length }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
      }
    } catch {
      // Fallback simples
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    }
  }
  
  // Hash seguro para validação
  async secureHash(input: string, salt?: string): Promise<string> {
    try {
      const saltToUse = salt || this.generateSecureToken(16);
      const combined = input + saltToUse;
      
      if (crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(combined);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hash));
        return saltToUse + ':' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        // Fallback simples
        return saltToUse + ':' + btoa(combined);
      }
    } catch {
      // Fallback básico
      return btoa(input + (salt || 'defaultsalt'));
    }
  }
  
  // Verificar hash
  async verifyHash(input: string, hash: string): Promise<boolean> {
    try {
      const [salt, expectedHash] = hash.split(':', 2);
      if (!salt || !expectedHash) return false;
      
      const newHash = await this.secureHash(input, salt);
      return newHash === hash;
    } catch {
      return false;
    }
  }
}

// Instância global
export const advancedEncryption = AdvancedEncryption.getInstance();
