
export interface EmailPattern {
  baseEmail: string;
  hasSuffix: boolean;
  suffix?: string;
  originalEmail: string;
  domain: string;
  localPart: string;
  baseLocalPart: string;
}

export const parseEmailPattern = (email: string): EmailPattern => {
  const emailRegex = /^([^+@]+)(\+[^@]+)?(@.+)$/;
  const match = email.match(emailRegex);
  
  if (!match) {
    return {
      baseEmail: email,
      hasSuffix: false,
      originalEmail: email,
      domain: '',
      localPart: email,
      baseLocalPart: email
    };
  }

  const [, baseLocalPart, suffix, domain] = match;
  const localPart = `${baseLocalPart}${suffix || ''}`;
  const baseEmail = `${baseLocalPart}${domain}`;
  
  return {
    baseEmail,
    hasSuffix: !!suffix,
    suffix: suffix?.substring(1), // Remove o +
    originalEmail: email,
    domain,
    localPart,
    baseLocalPart
  };
};

export const findRelatedEmails = (emails: string[], targetEmail: string): string[] => {
  const { baseLocalPart, domain } = parseEmailPattern(targetEmail);
  
  return emails.filter(email => {
    const parsed = parseEmailPattern(email);
    // Só considera conflito se for mesmo domínio E mesmo baseLocalPart
    return parsed.baseLocalPart === baseLocalPart && parsed.domain === domain;
  });
};

export const generateEmailVariations = (baseEmail: string): string[] => {
  const { baseLocalPart, domain } = parseEmailPattern(baseEmail);
  
  // Gerar possíveis variações que o Supabase pode criar no mesmo domínio
  const variations = [`${baseLocalPart}${domain}`];
  
  // Adicionar algumas variações comuns que o Supabase pode usar
  for (let i = 1; i <= 10; i++) {
    const randomSuffix = Math.floor(Math.random() * 99999);
    variations.push(`${baseLocalPart}+${randomSuffix}${domain}`);
  }
  
  return variations;
};

export const normalizeEmailForSearch = (email: string): string => {
  return parseEmailPattern(email).baseEmail;
};

/**
 * Verifica se dois emails podem coexistir no sistema
 * Retorna true se não há conflito (podem coexistir)
 * Retorna false se há conflito (são considerados duplicatas)
 */
export const canCoexist = (email1: string, email2: string): boolean => {
  const parsed1 = parseEmailPattern(email1);
  const parsed2 = parseEmailPattern(email2);
  
  // Se os domínios forem diferentes, sempre podem coexistir
  if (parsed1.domain !== parsed2.domain) {
    return true;
  }
  
  // Se o domínio for o mesmo, só podem coexistir se os baseLocalPart forem diferentes
  return parsed1.baseLocalPart !== parsed2.baseLocalPart;
};
