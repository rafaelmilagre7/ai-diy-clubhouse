/**
 * Valida um número de telefone brasileiro
 * @param phone Número de telefone para validar
 * @returns true se o telefone é válido
 */
export const validateBrazilianPhone = (phone: string): boolean => {
  if (!phone) return true; // Telefone não é obrigatório

  // Remover todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verificar se tem entre 10 e 11 dígitos (com ou sem 9 no início)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
  
  // Se tiver 11 dígitos, o 3º dígito deve ser 9
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') return false;
  
  // Verificar se não são todos os dígitos iguais
  const allSameDigits = /^(\d)\1+$/.test(cleanPhone);
  
  return !allSameDigits;
};

/**
 * Valida se um valor é um ID UUID válido
 * @param id ID para validar
 * @returns true se for um UUID válido
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Verifica se é um ID simulado (usado em testes)
 * @param id ID para verificar
 * @returns true se for um ID simulado
 */
export const isSimulatedID = (id: string): boolean => {
  return id?.startsWith('sim-') || id?.startsWith('test-');
};

/**
 * Valida uma URL do LinkedIn
 * @param url URL para validar
 * @returns true se for uma URL válida
 */
export const validateLinkedInUrl = (url: string): boolean => {
  if (!url) return true;
  
  // Flexível: aceita apenas nome de usuário, URL completa ou parcial
  const cleanURL = url.trim().toLowerCase();
  
  // Aceita perfil simples (só o username)
  if (!/^https?:\/\//i.test(cleanURL) && !cleanURL.includes('linkedin.com')) {
    return true;
  }
  
  // Aceita URL completa
  const linkedInRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
  
  return linkedInRegex.test(cleanURL);
};

/**
 * Valida um nome de usuário do Instagram
 * @param username Nome de usuário para validar
 * @returns true se for um nome de usuário válido
 */
export const validateInstagramUrl = (username: string): boolean => {
  if (!username) return true;
  
  const cleanUsername = username.trim().toLowerCase();
  
  // Aceita apenas o username
  if (!/^https?:\/\//i.test(cleanUsername) && !cleanUsername.includes('instagram.com')) {
    const usernameRegex = /^[a-zA-Z0-9._]{1,30}$/;
    return usernameRegex.test(cleanUsername.replace('@', ''));
  }
  
  // Aceita URL completa
  const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9._]{1,30})\/?$/;
  
  return instagramRegex.test(cleanUsername);
};

/**
 * Formata URLs de redes sociais para formato padrão
 * @param url URL ou username para formatar
 * @param platform 'linkedin' ou 'instagram'
 * @returns URL formatada
 */
export const formatSocialUrl = (url: string, platform: 'linkedin' | 'instagram'): string => {
  if (!url) return '';
  
  const cleanUrl = url.trim();
  
  // Se já é uma URL completa, retornar como está
  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }
  
  // Remover @ do início de usernames do Instagram
  const username = platform === 'instagram' ? cleanUrl.replace(/^@/, '') : cleanUrl;
  
  // Remover prefixos de domínio se existirem
  const cleanUsername = username
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/^(linkedin\.com\/in\/|instagram\.com\/)/, '');
    
  // Construir URL completa
  if (platform === 'linkedin') {
    return `https://linkedin.com/in/${cleanUsername}`;
  } else {
    return `https://instagram.com/${cleanUsername}`;
  }
};

/**
 * Verifica se a aplicação está em modo de desenvolvimento
 * @returns true se estiver em modo de desenvolvimento
 */
export const isDevelopmentMode = (): boolean => {
  // Verificar se está rodando em ambiente de desenvolvimento
  return import.meta.env.DEV || 
         import.meta.env.MODE === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

/**
 * Gera um UUID válido para uso em ambiente de desenvolvimento
 * @returns UUID string
 */
export const generateValidUUID = (): string => {
  // Implementação simplificada de um gerador de UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
