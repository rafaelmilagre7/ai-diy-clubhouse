
/**
 * Validates an international phone number in formats:
 * - "+dialCode|phoneNumber" (legacy format)
 * - "+dialCodePhoneNumber" (standard international format)
 */
export const validateInternationalPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Check if phone starts with +
  if (!phone.startsWith('+')) return false;
  
  let dialCode: string;
  let number: string;
  
  // Handle legacy format with separator "|"
  if (phone.includes('|')) {
    const parts = phone.split('|');
    if (parts.length !== 2) return false;
    [dialCode, number] = parts;
  } else {
    // Handle standard international format "+CountryCodePhoneNumber"
    // Extract country code (1-4 digits after +)
    const phoneWithoutPlus = phone.substring(1);
    
    // Try to extract country code (common country codes are 1-4 digits)
    let countryCodeLength = 1;
    const commonCountryCodes = ['1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49', '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98', '212', '213', '216', '218', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '290', '291', '297', '298', '299', '350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '370', '371', '372', '373', '374', '375', '376', '377', '378', '380', '381', '382', '383', '385', '386', '387', '389', '420', '421', '423', '500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '590', '591', '592', '593', '594', '595', '596', '597', '598', '599', '670', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '684', '685', '686', '687', '688', '689', '690', '691', '692', '850', '852', '853', '855', '856', '880', '886', '960', '961', '962', '963', '964', '965', '966', '967', '968', '970', '971', '972', '973', '974', '975', '976', '977', '992', '993', '994', '995', '996', '998'];
    
    // Find the longest matching country code
    for (let len = 4; len >= 1; len--) {
      const possibleCode = phoneWithoutPlus.substring(0, len);
      if (commonCountryCodes.includes(possibleCode)) {
        countryCodeLength = len;
        break;
      }
    }
    
    dialCode = '+' + phoneWithoutPlus.substring(0, countryCodeLength);
    number = phoneWithoutPlus.substring(countryCodeLength);
  }
  
  // Validate dial code format
  if (!dialCode.startsWith('+') || dialCode.length < 2 || dialCode.length > 5) {
    return false;
  }
  
  // Validate phone number (at least 4 digits for international format, max 15 total)
  const cleanNumber = number.replace(/\D/g, '');
  const totalLength = (dialCode.substring(1) + cleanNumber).length;
  
  return cleanNumber.length >= 4 && totalLength <= 15;
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
