
/**
 * Valida um número de telefone brasileiro
 * @param phone Número de telefone
 * @returns true se for válido
 */
export const validateBrazilianPhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const phoneDigits = phone.replace(/\D/g, '');
  
  // Aceitar telefones com DDD (10-11 dígitos)
  if (phoneDigits.length >= 10 && phoneDigits.length <= 11) {
    return true;
  }
  
  return false;
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
