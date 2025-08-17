
// ❌ VULNERABILIDADE CRÍTICA DE SEGURANÇA ❌
//
// Este arquivo usa CRIPTOGRAFIA FALSA (apenas base64)
// 
// 🚨 RISCO: btoa/atob NÃO É CRIPTOGRAFIA - dados facilmente expostos
// 🚨 Qualquer atacante pode executar: atob(dados) e ver tudo
//
// ✅ SUBSTITUÍDO POR: secureTokenStorage.ts com AES-256-GCM REAL
//
// @deprecated NUNCA use este arquivo - é uma vulnerabilidade
// @security Implementação insegura com base64

/**
 * ❌ FUNÇÃO INSEGURA - NÃO É CRIPTOGRAFIA REAL ❌
 * 
 * Esta função gera uma "chave" previsível que qualquer atacante pode reproduzir.
 * É usada com base64 (btoa/atob) que NÃO É CRIPTOGRAFIA.
 * 
 * @deprecated Esta função é uma VULNERABILIDADE DE SEGURANÇA
 * @param userId ID do usuário (exposto na chave gerada)
 * @returns String previsível que não oferece segurança real
 * @security VULNERABILIDADE: chave facilmente reproduzida por atacantes
 */
const generateKey = (userId: string): string => {
  console.error(`
🚨 VULNERABILIDADE DE SEGURANÇA 🚨
Função generateKey (insegura) chamada para userId: ${userId.substring(0, 8)}***

❌ Esta não é uma chave de criptografia real
❌ Qualquer atacante pode reproduzir: ${userId}-${window.location.hostname}
❌ Usada com base64 que expõe todos os dados

✅ Use secureTokenStorage.ts com AES-256-GCM real
  `);
  
  return `${userId}-${window.location.hostname}`;
};

/**
 * Interface para as funções de armazenamento seguro
 */
interface SecureStorage {
  /**
   * Armazena um valor de forma segura no localStorage
   * @param key Nome da chave para armazenar o valor
   * @param value Valor a ser armazenado (será serializado)
   * @param userId ID do usuário para derivar a chave de criptografia
   */
  setItem: (key: string, value: any, userId: string) => void;
  
  /**
   * Recupera um valor armazenado de forma segura
   * @param key Nome da chave para recuperar
   * @param userId ID do usuário para derivar a chave de criptografia
   * @returns Valor deserializado ou null se não encontrado ou inválido
   */
  getItem: (key: string, userId: string) => any;
  
  /**
   * Remove um item do localStorage
   * @param key Nome da chave para remover
   */
  removeItem: (key: string) => void;
}

/**
 * Implementação do armazenamento seguro
 */
export const secureStorage: SecureStorage = {
  setItem: (key: string, value: any, userId: string) => {
    console.error(`
🚨 VULNERABILIDADE CRÍTICA DETECTADA 🚨

Tentativa de "criptografar" dados com base64 (INSEGURO):
❌ Chave previsível: ${generateKey(userId)}
❌ Base64 NÃO É CRIPTOGRAFIA: btoa('${JSON.stringify(value).substring(0, 50)}...')
❌ Qualquer atacante pode decodificar: atob(dados) = dados expostos

🔒 MIGRE IMEDIATAMENTE para secureTokenStorage:
  import { secureTokenStorage } from '@/utils/secureTokenStorage';
  await secureTokenStorage.setItem('${key}', value, '${userId}');
    `);
    
    try {
      // ❌ MÉTODO INSEGURO - apenas para compatibilidade temporária
      const encryptionKey = generateKey(userId);
      const jsonValue = JSON.stringify(value);
      const encoded = btoa(encryptionKey + ':' + jsonValue);
      localStorage.setItem(key, encoded);
      
      console.warn(`❌ Dados salvos com CRIPTOGRAFIA FALSA. Migre para AES-256-GCM IMEDIATAMENTE.`);
    } catch (error) {
      console.error('Erro ao armazenar com método INSEGURO:', error);
    }
  },

  getItem: (key: string, userId: string) => {
    console.error(`
🚨 TENTATIVA DE DECODIFICAÇÃO INSEGURA 🚨

Dados sendo lidos com base64 (SEM CRIPTOGRAFIA REAL):
❌ Método: atob('${localStorage.getItem(key)?.substring(0, 30)}...')
❌ Qualquer atacante pode fazer o mesmo e ver todos os dados
❌ Não há proteção criptográfica real

🔒 MIGRAÇÃO NECESSÁRIA:
  import { secureTokenStorage } from '@/utils/secureTokenStorage';
  await secureTokenStorage.getItem('${key}', '${userId}');
    `);
    
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return null;
      
      // ❌ DECODIFICAÇÃO INSEGURA - dados expostos
      const decoded = atob(encoded);
      const [storedKey, jsonValue] = decoded.split(':');
      
      if (storedKey !== generateKey(userId)) {
        console.error('❌ "Violação de segurança" detectada - mas base64 não oferece segurança real!');
        return null;
      }
      
      console.warn(`❌ Dados lidos com MÉTODO INSEGURO. Dados estão EXPOSTOS sem criptografia real.`);
      return JSON.parse(jsonValue);
    } catch (error) {
      console.error('Erro ao recuperar com método INSEGURO:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};
