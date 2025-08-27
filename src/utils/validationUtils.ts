
/**
 * Validates an international phone number in formats:
 * - "+dialCode|phoneNumber" (legacy format)
 * - "+dialCodePhoneNumber" (standard international format)
 * 
 * Supports Brazilian numbers: +55 11 99999-9999 (11 digits local)
 * Supports international numbers with proper country code detection
 */
export const validateInternationalPhone = (phone: string): boolean => {
  console.log('🔍 [DEBUG] Validating phone:', phone);
  
  if (!phone || typeof phone !== 'string') {
    console.log('❌ [DEBUG] Invalid input - not a string or empty');
    return false;
  }
  
  // Check if phone starts with +
  if (!phone.startsWith('+')) {
    console.log('❌ [DEBUG] Phone does not start with +');
    return false;
  }
  
  let dialCode: string;
  let number: string;
  
  // Handle legacy format with separator "|"
  if (phone.includes('|')) {
    console.log('🔧 [DEBUG] Processing legacy format with |');
    const parts = phone.split('|');
    if (parts.length !== 2) {
      console.log('❌ [DEBUG] Invalid legacy format - wrong number of parts');
      return false;
    }
    [dialCode, number] = parts;
  } else {
    console.log('🔧 [DEBUG] Processing standard international format');
    // Handle standard international format "+CountryCodePhoneNumber"
    const phoneWithoutPlus = phone.substring(1);
    
    // Country code mapping for better detection
    const countryCodeMap: { [key: string]: number } = {
      // 1-digit codes
      '1': 1, '7': 1, 
      // 2-digit codes (including Brazil +55)
      '20': 2, '27': 2, '30': 2, '31': 2, '32': 2, '33': 2, '34': 2, '36': 2, '39': 2, '40': 2,
      '41': 2, '43': 2, '44': 2, '45': 2, '46': 2, '47': 2, '48': 2, '49': 2, '51': 2, '52': 2,
      '53': 2, '54': 2, '55': 2, '56': 2, '57': 2, '58': 2, '60': 2, '61': 2, '62': 2, '63': 2,
      '64': 2, '65': 2, '66': 2, '81': 2, '82': 2, '84': 2, '86': 2, '90': 2, '91': 2, '92': 2,
      '93': 2, '94': 2, '95': 2, '98': 2,
      // 3-digit codes
      '212': 3, '213': 3, '216': 3, '218': 3, '220': 3, '221': 3, '222': 3, '223': 3, '224': 3,
      '225': 3, '226': 3, '227': 3, '228': 3, '229': 3, '230': 3, '231': 3, '232': 3, '233': 3,
      '234': 3, '235': 3, '236': 3, '237': 3, '238': 3, '239': 3, '240': 3, '241': 3, '242': 3,
      '243': 3, '244': 3, '245': 3, '246': 3, '248': 3, '249': 3, '250': 3, '251': 3, '252': 3,
      '253': 3, '254': 3, '255': 3, '256': 3, '257': 3, '258': 3, '260': 3, '261': 3, '262': 3,
      '263': 3, '264': 3, '265': 3, '266': 3, '267': 3, '268': 3, '269': 3, '290': 3, '291': 3,
      '297': 3, '298': 3, '299': 3, '350': 3, '351': 3, '352': 3, '353': 3, '354': 3, '355': 3,
      '356': 3, '357': 3, '358': 3, '359': 3, '370': 3, '371': 3, '372': 3, '373': 3, '374': 3,
      '375': 3, '376': 3, '377': 3, '378': 3, '380': 3, '381': 3, '382': 3, '383': 3, '385': 3,
      '386': 3, '387': 3, '389': 3, '420': 3, '421': 3, '423': 3, '500': 3, '501': 3, '502': 3,
      '503': 3, '504': 3, '505': 3, '506': 3, '507': 3, '508': 3, '509': 3, '590': 3, '591': 3,
      '592': 3, '593': 3, '594': 3, '595': 3, '596': 3, '597': 3, '598': 3, '599': 3, '670': 3,
      '672': 3, '673': 3, '674': 3, '675': 3, '676': 3, '677': 3, '678': 3, '679': 3, '680': 3,
      '681': 3, '682': 3, '683': 3, '684': 3, '685': 3, '686': 3, '687': 3, '688': 3, '689': 3,
      '690': 3, '691': 3, '692': 3, '850': 3, '852': 3, '853': 3, '855': 3, '856': 3, '880': 3,
      '886': 3, '960': 3, '961': 3, '962': 3, '963': 3, '964': 3, '965': 3, '966': 3, '967': 3,
      '968': 3, '970': 3, '971': 3, '972': 3, '973': 3, '974': 3, '975': 3, '976': 3, '977': 3,
      '992': 3, '993': 3, '994': 3, '995': 3, '996': 3, '998': 3
    };
    
    // Find the correct country code length
    let countryCodeLength = 1; // Default to 1 digit
    
    // Try 3-digit codes first, then 2-digit, then 1-digit
    for (let len = 3; len >= 1; len--) {
      const possibleCode = phoneWithoutPlus.substring(0, len);
      if (countryCodeMap[possibleCode] === len) {
        countryCodeLength = len;
        break;
      }
    }
    
    dialCode = '+' + phoneWithoutPlus.substring(0, countryCodeLength);
    number = phoneWithoutPlus.substring(countryCodeLength);
    
    console.log('🔧 [DEBUG] Extracted - dialCode:', dialCode, 'number:', number);
  }
  
  // Validate dial code format
  if (!dialCode.startsWith('+') || dialCode.length < 2 || dialCode.length > 5) {
    console.log('❌ [DEBUG] Invalid dial code format:', dialCode);
    return false;
  }
  
  // Clean the number (remove all non-digits)
  const cleanNumber = number.replace(/\D/g, '');
  console.log('🔧 [DEBUG] Clean number:', cleanNumber, 'length:', cleanNumber.length);
  
  // Special validation for Brazilian numbers (+55)
  if (dialCode === '+55') {
    console.log('🇧🇷 [DEBUG] Validating Brazilian number');
    // Brazilian mobile numbers: 11 digits (DDD + 9 + 8 digits)
    // Brazilian landline numbers: 10 digits (DDD + 7-8 digits)
    const isValidBrazilian = cleanNumber.length === 10 || cleanNumber.length === 11;
    console.log('🇧🇷 [DEBUG] Brazilian validation result:', isValidBrazilian);
    return isValidBrazilian;
  }
  
  // General international validation
  // Most international numbers: 4-15 digits total (including country code)
  const countryCodeDigits = dialCode.substring(1);
  const totalLength = countryCodeDigits.length + cleanNumber.length;
  
  console.log('🌍 [DEBUG] International validation - total length:', totalLength);
  
  const isValid = cleanNumber.length >= 4 && totalLength >= 7 && totalLength <= 15;
  console.log('✅ [DEBUG] Final validation result:', isValid);
  
  return isValid;
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
