
/**
 * Funções de validação para formulários do onboarding
 */

/**
 * Valida um número de telefone brasileiro
 * @param phone Número de telefone para validar
 * @returns boolean indicando se é válido
 */
export const validateBrazilianPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem entre 10 e 11 dígitos (com ou sem DDD)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return false;
  }
  
  // Verifica se não é número repetido
  const isRepeated = /^(\d)\1+$/.test(cleanPhone);
  if (isRepeated) {
    return false;
  }
  
  return true;
};

/**
 * Valida uma URL do LinkedIn
 * @param url URL do LinkedIn para validar
 * @returns boolean indicando se é válida
 */
export const validateLinkedInUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Aceita URLs com ou sem protocolo
  const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  return linkedinPattern.test(url);
};

/**
 * Valida um nome de usuário do Instagram
 * @param username Nome de usuário do Instagram para validar
 * @returns boolean indicando se é válido
 */
export const validateInstagramUrl = (username: string): boolean => {
  if (!username) return false;
  
  // Remove @ do início, se houver
  const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
  
  // Aceita apenas o username ou URLs completas
  const isUsername = /^[a-zA-Z0-9._]{1,30}$/.test(cleanUsername);
  const isUrl = /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9._]{1,30})\/?$/i.test(username);
  
  return isUsername || isUrl;
};

/**
 * Formata uma URL de rede social
 * @param url URL ou username a ser formatado
 * @param network Tipo de rede social ('linkedin' ou 'instagram')
 * @returns string URL formatada
 */
export const formatSocialUrl = (url: string, network: 'linkedin' | 'instagram'): string => {
  if (!url) return '';
  
  if (network === 'linkedin') {
    // Se não começa com http:// ou https://, adiciona https://
    if (!url.match(/^https?:\/\//)) {
      // Se não começa com www.linkedin.com
      if (!url.match(/^www\.linkedin\.com/)) {
        // Se começa com linkedin.com
        if (url.match(/^linkedin\.com/)) {
          return `https://www.${url}`;
        }
        // Se começa com /in/
        else if (url.match(/^\/in\//)) {
          return `https://www.linkedin.com${url}`;
        }
        // Se é apenas o nome de usuário
        else if (!url.includes('/')) {
          return `https://www.linkedin.com/in/${url}`;
        }
        // Outros casos
        return `https://www.linkedin.com/in/${url}`;
      }
      return `https://${url}`;
    }
  } 
  else if (network === 'instagram') {
    // Remover @ do início, se houver
    const username = url.startsWith('@') ? url.substring(1) : url;
    
    // Se é uma URL completa, retornar como está
    if (username.match(/^https?:\/\//)) {
      return username;
    }
    
    // Se começa com www.instagram.com ou instagram.com
    if (username.match(/^(www\.)?instagram\.com/)) {
      return `https://${username.replace(/^www\./, '')}`;
    }
    
    // Outros casos, é apenas o nome de usuário
    return `https://www.instagram.com/${username}`;
  }
  
  return url;
};

/**
 * Gera um UUID válido
 * @returns string UUID
 */
export const generateValidUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Verifica se estamos em modo de desenvolvimento
 * @returns boolean indicando se é ambiente de desenvolvimento
 */
export const isDevelopmentMode = (): boolean => {
  return import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';
};
