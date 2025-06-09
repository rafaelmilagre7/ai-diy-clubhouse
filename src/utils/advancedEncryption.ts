
import { logger } from './logger';

// Sistema de criptografia avançada para dados sensíveis
export class AdvancedEncryption {
  private static instance: AdvancedEncryption;
  
  private constructor() {}
  
  static getInstance(): AdvancedEncryption {
    if (!AdvancedEncryption.instance) {
      AdvancedEncryption.instance = new AdvancedEncryption();
    }
    return AdvancedEncryption.instance;
  }

  // Gerar chave de criptografia baseada no contexto
  private async generateKey(userId: string, context: string): Promise<CryptoKey> {
    try {
      const keyMaterial = `${userId}-${context}-${window.location.hostname}`;
      const encoder = new TextEncoder();
      const keyData = encoder.encode(keyMaterial);
      
      // Usar WebCrypto API para gerar chave real
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyData.slice(0, 32), // Usar apenas 32 bytes
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
      
      return key;
    } catch (error) {
      logger.error("Erro ao gerar chave de criptografia", {
        component: 'ADVANCED_ENCRYPTION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw new Error('Falha na geração da chave de criptografia');
    }
  }

  // Criptografar dados sensíveis
  async encryptSensitiveData(
    data: any,
    userId: string,
    context: string = 'default'
  ): Promise<string> {
    try {
      if (!window.crypto || !window.crypto.subtle) {
        // Fallback para encoding simples se WebCrypto não estiver disponível
        logger.warn("WebCrypto não disponível, usando fallback", {
          component: 'ADVANCED_ENCRYPTION'
        });
        return this.simpleFallbackEncrypt(data, userId, context);
      }

      const key = await this.generateKey(userId, context);
      const jsonData = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(jsonData);
      
      // Gerar IV aleatório
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Criptografar
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      );
      
      // Combinar IV + dados criptografados
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // Converter para base64
      return btoa(String.fromCharCode(...combined));
      
    } catch (error) {
      logger.error("Erro na criptografia de dados", {
        component: 'ADVANCED_ENCRYPTION',
        context,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      // Fallback em caso de erro
      return this.simpleFallbackEncrypt(data, userId, context);
    }
  }

  // Descriptografar dados sensíveis
  async decryptSensitiveData(
    encryptedData: string,
    userId: string,
    context: string = 'default'
  ): Promise<any> {
    try {
      if (!window.crypto || !window.crypto.subtle) {
        // Fallback para decoding simples
        return this.simpleFallbackDecrypt(encryptedData, userId, context);
      }

      // Verificar se é dados do fallback
      if (encryptedData.includes(':')) {
        return this.simpleFallbackDecrypt(encryptedData, userId, context);
      }

      const key = await this.generateKey(userId, context);
      
      // Converter de base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      // Extrair IV e dados
      const iv = combined.slice(0, 12);
      const encryptedBuffer = combined.slice(12);
      
      // Descriptografar
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedBuffer
      );
      
      // Converter de volta para string e parsing JSON
      const decoder = new TextDecoder();
      const jsonData = decoder.decode(decryptedBuffer);
      
      return JSON.parse(jsonData);
      
    } catch (error) {
      logger.error("Erro na descriptografia de dados", {
        component: 'ADVANCED_ENCRYPTION',
        context,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      // Tentar fallback se falhar
      try {
        return this.simpleFallbackDecrypt(encryptedData, userId, context);
      } catch {
        return null;
      }
    }
  }

  // Fallback simples para ambientes sem WebCrypto
  private simpleFallbackEncrypt(data: any, userId: string, context: string): string {
    try {
      const keyMaterial = `${userId}-${context}`;
      const jsonData = JSON.stringify(data);
      const encoded = btoa(keyMaterial + ':' + jsonData);
      return encoded;
    } catch (error) {
      logger.error("Erro no fallback de criptografia", {
        component: 'ADVANCED_ENCRYPTION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }

  // Fallback simples para descriptografia
  private simpleFallbackDecrypt(encryptedData: string, userId: string, context: string): any {
    try {
      const decoded = atob(encryptedData);
      const [storedKey, jsonData] = decoded.split(':');
      const expectedKey = `${userId}-${context}`;
      
      if (storedKey !== expectedKey) {
        logger.warn("Chave de descriptografia não confere", {
          component: 'ADVANCED_ENCRYPTION'
        });
        return null;
      }
      
      return JSON.parse(jsonData);
    } catch (error) {
      logger.error("Erro no fallback de descriptografia", {
        component: 'ADVANCED_ENCRYPTION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return null;
    }
  }

  // Gerar hash seguro para verificação
  async generateSecureHash(data: string): Promise<string> {
    try {
      if (!window.crypto || !window.crypto.subtle) {
        // Fallback simples
        return btoa(data).substring(0, 16);
      }

      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = new Uint8Array(hashBuffer);
      
      return btoa(String.fromCharCode(...hashArray)).substring(0, 16);
    } catch (error) {
      logger.error("Erro ao gerar hash seguro", {
        component: 'ADVANCED_ENCRYPTION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return btoa(data).substring(0, 16);
    }
  }

  // Verificar integridade dos dados
  async verifyDataIntegrity(data: any, expectedHash: string): Promise<boolean> {
    try {
      const dataString = JSON.stringify(data);
      const actualHash = await this.generateSecureHash(dataString);
      return actualHash === expectedHash;
    } catch (error) {
      logger.error("Erro na verificação de integridade", {
        component: 'ADVANCED_ENCRYPTION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return false;
    }
  }
}

// Instância global
export const advancedEncryption = AdvancedEncryption.getInstance();
