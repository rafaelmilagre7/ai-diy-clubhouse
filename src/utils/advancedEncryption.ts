
/**
 * DEPRECIADO: Criptografia Falsa - Apenas Ofuscação
 * 
 * ❌ VULNERABILIDADE CRÍTICA DE SEGURANÇA ❌
 * 
 * Este arquivo implementava apenas base64 encoding disfarçado de criptografia.
 * 
 * 🚨 DADOS FACILMENTE EXPOSTOS: 
 *    atob('dados_criptografados') = dados em texto claro!
 * 
 * ✅ SUBSTITUÍDO POR: secureTokenStorage.ts com AES-256-GCM REAL
 * 
 * @deprecated NUNCA use este arquivo - é uma vulnerabilidade de segurança
 * @security IMPLEMENTAÇÃO INSEGURA - apenas ofuscação base64
 * @migration Use useSecureTokenStorage ou secureTokenStorage
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
    logger.error('🚨 VULNERABILIDADE CRÍTICA: AdvancedEncryption detectado', {
      component: 'DEPRECATED_FAKE_ENCRYPTION',
      message: '❌ Esta classe faz apenas ofuscação base64, NÃO É CRIPTOGRAFIA REAL',
      security: 'DADOS FACILMENTE EXPOSTOS - qualquer atacante pode decodificar',
      solution: 'Use secureTokenStorage.ts com AES-256-GCM REAL',
      migration: 'useSecureTokenStorage hook disponível para migração automática'
    });
    
    console.error(`
🚨 VULNERABILIDADE DE SEGURANÇA DETECTADA 🚨

Tentativa de uso do AdvancedEncryption (criptografia FALSA):
❌ Apenas base64 encoding - dados facilmente expostos
❌ Qualquer atacante pode fazer: atob(dados) e ver tudo
❌ Não oferece proteção real contra vazamentos

✅ SOLUÇÃO IMEDIATA:
  import { useSecureTokenStorage } from '@/hooks/useSecureTokenStorage';
  // ou
  import { secureTokenStorage } from '@/utils/secureTokenStorage';

🔒 Migração automática disponível para dados existentes.
    `);
    
    throw new Error(
      '🚨 AdvancedEncryption é uma VULNERABILIDADE DE SEGURANÇA. Use secureTokenStorage com AES-256-GCM real.'
    );
  }
  
  async decryptSensitiveData(encryptedData: string, userId: string, context: string = 'storage'): Promise<any> {
    logger.error('🚨 TENTATIVA de decodificação insegura detectada', {
      component: 'DEPRECATED_FAKE_ENCRYPTION',
      message: '❌ Esta classe faz apenas decodificação base64, NÃO É DESCRIPTOGRAFIA',
      security: 'DADOS EXPOSTOS - sem proteção criptográfica real',
      action: 'Bloqueando acesso para prevenir vulnerabilidades'
    });
    
    console.error(`
🚨 BLOQUEIO DE SEGURANÇA 🚨

Tentativa de descriptografia com método INSEGURO detectada.
❌ Base64 não é criptografia - dados estão expostos
✅ Use secureTokenStorage para AES-256-GCM real

Migração automática disponível.
    `);
    
    throw new Error(
      '🚨 Método inseguro bloqueado. Use secureTokenStorage com AES-256-GCM real.'
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
