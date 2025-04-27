
// Utilitário para encriptar dados sensíveis no localStorage
// Usa uma chave derivada do user_id como chave de encriptação
const generateKey = (userId: string): string => {
  return `${userId}-${window.location.hostname}`;
};

export const secureStorage = {
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
