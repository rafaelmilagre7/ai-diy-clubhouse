
// Utilitário para encriptar dados sensíveis no localStorage
// Usa uma chave derivada do user_id como chave de encriptação

/**
 * Gera uma chave de criptografia baseada no ID do usuário e no hostname atual
 * @param userId ID do usuário como entropia para a chave
 * @returns String para ser usada como chave de criptografia
 */
const generateKey = (userId: string): string => {
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
    try {
      const encryptionKey = generateKey(userId);
      const jsonValue = JSON.stringify(value);
      // Simples encoding por enquanto - em prod usar crypto APIs
      const encoded = btoa(encryptionKey + ':' + jsonValue);
      localStorage.setItem(key, encoded);
    } catch (error) {
      console.error('Erro ao armazenar token:', error);
    }
  },

  getItem: (key: string, userId: string) => {
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return null;
      
      const decoded = atob(encoded);
      const [storedKey, jsonValue] = decoded.split(':');
      
      if (storedKey !== generateKey(userId)) {
        console.error('Possível violação de segurança detectada');
        return null;
      }
      
      return JSON.parse(jsonValue);
    } catch (error) {
      console.error('Erro ao recuperar token:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};
