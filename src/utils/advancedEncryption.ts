
/**
 * DEPRECIADO: Criptografia Falsa - Apenas Ofuscação
 * 
 * Este arquivo implementava apenas base64 encoding disfarçado de criptografia.
 * Foi substituído por criptografia AES-GCM real em realCryptography.ts
 * 
 * @deprecated Use RealCryptography para criptografia de verdade
 * @security Esta implementação é INSEGURA - apenas ofuscação
 */

import { logger } from './logger';

export class AdvancedEncryption {
  private static instance: AdvancedEncryption;
  
  private constructor() {}
  
  static getInstance(): AdvancedEncryption {
    if (!AdvancedEncryption.instance) {
      AdvancedEncryption.instance = new AdvancedEncryption();
    }
    return AdvancedEncryption.instance;
  }
  
  async encryptSensitiveData(data: any, userId: string, context: string = 'storage'): Promise<string> {
    logger.error('AdvancedEncryption está depreciado por segurança', {
      component: 'DEPRECATED_FAKE_ENCRYPTION',
      message: 'Esta classe faz apenas ofuscação base64, não criptografia real',
      security: 'VULNERABILIDADE: Dados facilmente decodificáveis',
      solution: 'Use RealCryptography com AES-GCM'
    });
    
    throw new Error(
      'AdvancedEncryption foi depreciado por ser inseguro. Use RealCryptography.'
    );
  }
  
  async decryptSensitiveData(encryptedData: string, userId: string, context: string = 'storage'): Promise<any> {
    logger.error('AdvancedEncryption está depreciado por segurança', {
      component: 'DEPRECATED_FAKE_ENCRYPTION',
      message: 'Esta classe faz apenas decodificação base64, não descriptografia',
      security: 'VULNERABILIDADE: Sem proteção real'
    });
    
    throw new Error(
      'AdvancedEncryption foi depreciado por ser inseguro. Use RealCryptography.'
    );
  }
  
  // Manter apenas métodos que não envolvem "criptografia" falsa
  generateSecureToken(length: number = 32): string {
    try {
      if (crypto.getRandomValues) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      } else {
        return Array.from({ length }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
      }
    } catch {
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    }
  }
}

// Instância global (depreciada)
export const advancedEncryption = AdvancedEncryption.getInstance();
