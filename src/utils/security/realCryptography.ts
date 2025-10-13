/**
 * Criptografia Real usando Web Crypto API
 * 
 * Substitui a ofuscação falsa por criptografia AES-GCM de verdade
 */

import { logger } from '@/utils/logger';

export class RealCryptography {
  private static instance: RealCryptography;
  
  private constructor() {}
  
  static getInstance(): RealCryptography {
    if (!RealCryptography.instance) {
      RealCryptography.instance = new RealCryptography();
    }
    return RealCryptography.instance;
  }

  /**
   * Gera uma chave de criptografia real derivada do userId
   */
  private async deriveKey(userId: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(userId + window.location.origin),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000, // 100k iterações para segurança
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 }, // AES-256-GCM
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Criptografia AES-GCM real (não ofuscação!)
   */
  async encryptData(data: any, userId: string): Promise<string> {
    try {
      if (!crypto.subtle) {
        throw new Error('Web Crypto API não disponível - ambiente inseguro');
      }

      // Dados + metadados
      const payload = {
        data: JSON.stringify(data),
        timestamp: Date.now(),
        userId: userId.substring(0, 8), // Parcial para verificação
        version: 'v1'
      };

      const plaintext = new TextEncoder().encode(JSON.stringify(payload));
      
      // Gerar salt e IV criptograficamente seguros
      const salt = crypto.getRandomValues(new Uint8Array(32));
      const iv = crypto.getRandomValues(new Uint8Array(16));
      
      // Derivar chave real
      const key = await this.deriveKey(userId, salt);
      
      // Criptografia AES-GCM real
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        plaintext
      );

      // Combinar salt + iv + dados criptografados
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      // Converter para base64 para armazenamento (agora sim é seguro!)
      const result = btoa(String.fromCharCode(...combined));

      logger.info("Dados criptografados com AES-GCM", {
        component: 'REAL_CRYPTOGRAPHY',
        algorithm: 'AES-256-GCM',
        saltLength: salt.length,
        ivLength: iv.length,
        encryptedLength: encrypted.byteLength
      });

      return result;
    } catch (error) {
      logger.error("Erro na criptografia AES", {
        component: 'REAL_CRYPTOGRAPHY',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw new Error('Falha na criptografia de dados');
    }
  }

  /**
   * Descriptografia AES-GCM real
   */
  async decryptData(encryptedData: string, userId: string): Promise<any> {
    try {
      if (!crypto.subtle) {
        throw new Error('Web Crypto API não disponível - ambiente inseguro');
      }

      // Decodificar de base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      // Extrair salt, IV e dados criptografados
      const salt = combined.slice(0, 32);
      const iv = combined.slice(32, 48);
      const encrypted = combined.slice(48);

      // Derivar a mesma chave
      const key = await this.deriveKey(userId, salt);

      // Descriptografar
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
      );

      // Decodificar e validar
      const plaintext = new TextDecoder().decode(decrypted);
      const payload = JSON.parse(plaintext);

      // Validações de segurança
      if (payload.userId !== userId.substring(0, 8)) {
        throw new Error('Dados corrompidos - userId inválido');
      }

      // Verificar expiração (24 horas)
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000;
      
      if (now - payload.timestamp > maxAge) {
        throw new Error('Dados expirados');
      }

      logger.info("Dados descriptografados com sucesso", {
        component: 'REAL_CRYPTOGRAPHY',
        algorithm: 'AES-256-GCM'
      });

      return JSON.parse(payload.data);
    } catch (error) {
      logger.error("Erro na descriptografia AES", {
        component: 'REAL_CRYPTOGRAPHY',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return null;
    }
  }

  /**
   * Gera hash criptográfico real (SHA-256)
   */
  async secureHash(input: string, salt?: string): Promise<string> {
    try {
      if (!crypto.subtle) {
        throw new Error('Web Crypto API não disponível');
      }

      const saltToUse = salt || this.generateSecureSalt();
      const combined = input + saltToUse;
      
      const encoder = new TextEncoder();
      const data = encoder.encode(combined);
      const hash = await crypto.subtle.digest('SHA-256', data);
      
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return saltToUse + ':' + hashHex;
    } catch (error) {
      logger.error("Erro no hash seguro", {
        component: 'REAL_CRYPTOGRAPHY',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw new Error('Falha na geração de hash');
    }
  }

  /**
   * Gera salt criptograficamente seguro
   */
  private generateSecureSalt(length: number = 32): string {
    const array = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica hash de forma segura (timing-safe)
   */
  async verifyHash(input: string, hash: string): Promise<boolean> {
    try {
      const [salt, expectedHash] = hash.split(':', 2);
      if (!salt || !expectedHash) return false;
      
      const newHash = await this.secureHash(input, salt);
      const [, newHashValue] = newHash.split(':', 2);
      
      // Comparação timing-safe
      return this.constantTimeEquals(expectedHash, newHashValue);
    } catch {
      return false;
    }
  }

  /**
   * Comparação timing-safe para prevenir timing attacks
   */
  private constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Verifica se o ambiente suporta criptografia real
   */
  isSecureEnvironment(): boolean {
    return (
      typeof crypto !== 'undefined' && 
      typeof crypto.subtle !== 'undefined' &&
      window.location.protocol === 'https:' || 
      window.location.hostname === 'localhost'
    );
  }

  /**
   * Migra dados da ofuscação falsa para criptografia real
   */
  async migrateFromFakeEncryption(
    fakeEncryptedData: string, 
    userId: string
  ): Promise<string> {
    try {
      // Tentar decodificar a ofuscação antiga
      const decoded = decodeURIComponent(atob(fakeEncryptedData));
      const [key, dataWithTimestamp] = decoded.split(':', 2);
      
      if (dataWithTimestamp) {
        const parsed = JSON.parse(dataWithTimestamp);
        const originalData = JSON.parse(parsed.data);
        
        // Re-criptografar com AES real
        return await this.encryptData(originalData, userId);
      }
      
      throw new Error('Formato inválido da ofuscação antiga');
    } catch (error) {
      logger.error("Erro na migração de dados", {
        component: 'REAL_CRYPTOGRAPHY',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw new Error('Falha na migração de dados');
    }
  }
}

// Instância singleton
export const realCryptography = RealCryptography.getInstance();