
/**
 * Validates an international phone number in the format "+dialCode|phoneNumber"
 */
export const validateInternationalPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  const parts = phone.split('|');
  if (parts.length !== 2) return false;
  
  const [dialCode, number] = parts;
  
  // Validate dial code format
  if (!dialCode.startsWith('+') || dialCode.length < 2 || dialCode.length > 5) {
    return false;
  }
  
  // Validate phone number (at least 8 digits, max 15)
  const cleanNumber = number.replace(/\D/g, '');
  return cleanNumber.length >= 8 && cleanNumber.length <= 15;
};

/**
 * Validates a Brazilian phone number (legacy support)
 * Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export const validateBrazilianPhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem entre 10 e 11 dígitos (com ou sem o 9)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return false;
  }
  
  // Para telefones de 11 dígitos, verifica se o primeiro dígito após DDD é 9
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') {
    return false;
  }
  
  // Se chegou até aqui, o formato é válido
  return true;
};

/**
 * Valida uma URL do LinkedIn
 * Aceita formatos como: linkedin.com/in/perfil, https://linkedin.com/in/perfil, etc.
 */
export const validateLinkedInUrl = (url: string): boolean => {
  if (!url) return true; // URL é opcional
  
  // Verificar se contém o domínio do LinkedIn
  const hasLinkedInDomain = url.includes('linkedin.com');
  
  // Verificar se contém caminho de perfil
  const hasProfilePath = url.includes('/in/');
  
  return hasLinkedInDomain || hasProfilePath;
};

/**
 * Valida uma URL do Instagram
 * Aceita formatos como: instagram.com/perfil, https://instagram.com/perfil, @perfil, etc.
 */
export const validateInstagramUrl = (url: string): boolean => {
  if (!url) return true; // URL é opcional
  
  // Verificar se contém o domínio do Instagram
  const hasInstagramDomain = url.includes('instagram.com');
  
  // Verificar se é um handle do Instagram (começa com @)
  const isInstagramHandle = url.startsWith('@');
  
  return hasInstagramDomain || isInstagramHandle;
};

/**
 * Formata uma URL de rede social para garantir que tenha o formato correto
 * @param url URL a ser formatada
 * @param network Rede social ('linkedin' ou 'instagram')
 * @returns URL formatada
 */
export const formatSocialUrl = (url: string, network: 'linkedin' | 'instagram'): string => {
  if (!url) return '';
  
  // Remover espaços em branco
  let formattedUrl = url.trim();
  
  if (network === 'linkedin') {
    // Se for apenas um nome de usuário sem domínio
    if (!formattedUrl.includes('linkedin.com') && !formattedUrl.includes('://')) {
      // Verificar se começa com /in/
      if (formattedUrl.startsWith('/in/')) {
        formattedUrl = `https://linkedin.com${formattedUrl}`;
      } 
      // Verificar se começa apenas com 'in/'
      else if (formattedUrl.startsWith('in/')) {
        formattedUrl = `https://linkedin.com/${formattedUrl}`;
      }
      // Se for apenas o username
      else if (!formattedUrl.includes('/')) {
        formattedUrl = `https://linkedin.com/in/${formattedUrl}`;
      }
    }
    
    // Adicionar protocolo se não existir
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }
  } 
  else if (network === 'instagram') {
    // Se começar com @, converter para URL
    if (formattedUrl.startsWith('@')) {
      formattedUrl = `https://instagram.com/${formattedUrl.substring(1)}`;
    } 
    // Se for apenas um nome de usuário sem domínio
    else if (!formattedUrl.includes('instagram.com') && !formattedUrl.includes('://')) {
      formattedUrl = `https://instagram.com/${formattedUrl}`;
    }
    
    // Adicionar protocolo se não existir
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }
  }
  
  return formattedUrl;
};
