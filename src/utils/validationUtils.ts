
/**
 * Funções de validação reutilizáveis para todo o sistema
 */

/**
 * Valida se uma string é um UUID válido
 * @param id String a ser validada
 * @returns Boolean indicando se é um UUID válido
 */
export const isValidUUID = (id: string | null | undefined): boolean => {
  if (!id) return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Determina se estamos em ambiente de desenvolvimento
 * @returns Boolean indicando se é ambiente de desenvolvimento
 */
export const isDevelopmentMode = (): boolean => {
  // Verifica se estamos em ambiente de desenvolvimento
  // Em um ambiente real, esta verificação seria baseada em variáveis de ambiente
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

/**
 * Gera um UUID válido para uso em desenvolvimento
 * @returns String contendo UUID válido
 */
export const generateValidUUID = (): string => {
  // Usar crypto.randomUUID() se disponível no navegador
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback simples para gerar UUID se randomUUID não estiver disponível
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Verifica se um ID é um UUID simulado de ambiente de desenvolvimento
 * @param id ID a verificar
 * @returns Boolean indicando se é um ID simulado
 */
export const isSimulatedID = (id: string | null | undefined): boolean => {
  if (!id) return false;
  return isDevelopmentMode() && !isValidUUID(id);
};

/**
 * Validador de telefone brasileiro
 * @param phone Número de telefone a ser validado
 * @returns Boolean indicando se é um telefone válido
 */
export const validateBrazilianPhone = (phone: string): boolean => {
  if (!phone) return true; // Opcional
  
  // Aceitar formatado e não formatado
  // Aceita: (99) 99999-9999, 99999999999, etc.
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

/**
 * Validador de URL do LinkedIn
 * @param url URL do LinkedIn a ser validada
 * @returns Boolean indicando se é uma URL válida
 */
export const validateLinkedInUrl = (url: string): boolean => {
  if (!url) return true; // Opcional
  return url.includes('linkedin.com') || url.includes('in/');
};

/**
 * Validador de URL do Instagram
 * @param url URL do Instagram a ser validada
 * @returns Boolean indicando se é uma URL válida
 */
export const validateInstagramUrl = (url: string): boolean => {
  if (!url) return true; // Opcional
  return url.includes('instagram.com') || url.startsWith('@');
};

/**
 * Formata uma URL de rede social para garantir formato correto
 * @param url URL a ser formatada
 * @param platform Plataforma (linkedin ou instagram)
 * @returns URL formatada
 */
export const formatSocialUrl = (url: string, platform: 'linkedin' | 'instagram'): string => {
  if (!url) return '';
  
  // Remove espaços e caracteres indesejados
  let cleanUrl = url.trim();
  
  // Já tem protocolo? Se não, adicionar https://
  if (!cleanUrl.match(/^https?:\/\//)) {
    cleanUrl = `https://${cleanUrl}`;
  }
  
  // Verificações específicas por plataforma
  if (platform === 'linkedin') {
    // Garantir que tem linkedin.com
    if (!cleanUrl.includes('linkedin.com')) {
      // Se parece um ID do LinkedIn (ex: johndoe), converter para URL completa
      if (!cleanUrl.includes('/')) {
        return `https://linkedin.com/in/${cleanUrl.replace('https://', '')}`;
      }
    }
  }
  
  if (platform === 'instagram') {
    // Garantir que tem instagram.com
    if (!cleanUrl.includes('instagram.com')) {
      // Se começa com @, remover @ e adicionar URL
      if (cleanUrl.includes('@')) {
        return `https://instagram.com/${cleanUrl.replace('@', '').replace('https://', '')}`;
      }
      // Se parece um username do Instagram sem @, converter para URL completa
      if (!cleanUrl.includes('/')) {
        return `https://instagram.com/${cleanUrl.replace('https://', '')}`;
      }
    }
  }
  
  return cleanUrl;
};
