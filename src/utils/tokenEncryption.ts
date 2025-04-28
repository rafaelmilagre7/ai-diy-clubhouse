
/**
 * Utilitário simples para armazenamento seguro de tokens
 * Usa prefixos de user ID para separar tokens entre usuários
 */

interface StorageInterface {
  getItem: (key: string, userId?: string) => any;
  setItem: (key: string, value: any, userId?: string) => void;
  removeItem: (key: string, userId?: string) => void;
}

class SecureStorage implements StorageInterface {
  private storage: Storage;
  
  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }
  
  /**
   * Recupera um item do storage com o prefixo de userId
   */
  getItem(key: string, userId?: string): any {
    const storageKey = userId ? `${userId}:${key}` : key;
    const item = this.storage.getItem(storageKey);
    if (!item) return null;
    
    try {
      return JSON.parse(item);
    } catch (e) {
      console.error('Erro ao decodificar item do storage:', e);
      return null;
    }
  }
  
  /**
   * Armazena um item no storage com o prefixo de userId
   */
  setItem(key: string, value: any, userId?: string): void {
    const storageKey = userId ? `${userId}:${key}` : key;
    
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(storageKey, serialized);
    } catch (e) {
      console.error('Erro ao codificar item para storage:', e);
    }
  }
  
  /**
   * Remove um item do storage
   */
  removeItem(key: string, userId?: string): void {
    const storageKey = userId ? `${userId}:${key}` : key;
    this.storage.removeItem(storageKey);
  }
}

export const secureStorage = new SecureStorage();
