
// Validação de WhatsApp brasileiro
export const validateBrazilianWhatsApp = (phone: string): boolean => {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos (9 + 8 dígitos)
  if (cleaned.length !== 11) return false;
  
  // Verifica se começa com 9 (celular)
  if (cleaned[2] !== '9') return false;
  
  // Verifica códigos de área válidos do Brasil (11-99)
  const areaCode = cleaned.substring(0, 2);
  const validAreaCodes = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
    '21', '22', '24', // RJ
    '27', '28', // ES
    '31', '32', '33', '34', '35', '37', '38', // MG
    '41', '42', '43', '44', '45', '46', // PR
    '47', '48', '49', // SC
    '51', '53', '54', '55', // RS
    '61', // DF
    '62', '64', // GO
    '63', // TO
    '65', '66', // MT
    '67', // MS
    '68', // AC
    '69', // RO
    '71', '73', '74', '75', '77', // BA
    '79', // SE
    '81', '87', // PE
    '82', // AL
    '83', // PB
    '84', // RN
    '85', '88', // CE
    '86', '89', // PI
    '91', '93', '94', // PA
    '92', '97', // AM
    '95', // RR
    '96', // AP
    '98', '99' // MA
  ];
  
  return validAreaCodes.includes(areaCode);
};

// Formatar WhatsApp para exibição
export const formatWhatsApp = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  }
  return phone;
};

// Limpar WhatsApp para salvamento
export const cleanWhatsApp = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// Validação de telefone brasileiro
export const validateBrazilianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Aceita tanto celular (11 dígitos) quanto fixo (10 dígitos)
  return cleaned.length === 10 || cleaned.length === 11;
};

// Validação de URL do LinkedIn
export const validateLinkedInUrl = (url: string): boolean => {
  if (!url) return true; // Campo opcional
  const linkedInPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-_]+\/?$/;
  return linkedInPattern.test(url);
};

// Validação de URL do Instagram
export const validateInstagramUrl = (url: string): boolean => {
  if (!url) return true; // Campo opcional
  const instagramPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
  return instagramPattern.test(url);
};

// Formatar URLs de redes sociais
export const formatSocialUrl = (url: string, platform: 'linkedin' | 'instagram'): string => {
  if (!url) return '';
  
  // Remove protocolos e www se existirem
  let cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Se não contém o domínio, adiciona
  if (platform === 'linkedin' && !cleanUrl.includes('linkedin.com')) {
    cleanUrl = `linkedin.com/in/${cleanUrl}`;
  } else if (platform === 'instagram' && !cleanUrl.includes('instagram.com')) {
    cleanUrl = `instagram.com/${cleanUrl}`;
  }
  
  // Adiciona https://
  return `https://${cleanUrl}`;
};
