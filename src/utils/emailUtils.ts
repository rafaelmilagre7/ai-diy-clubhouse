
export interface EmailPattern {
  baseEmail: string;
  hasSuffix: boolean;
  suffix?: string;
  originalEmail: string;
}

export const parseEmailPattern = (email: string): EmailPattern => {
  const emailRegex = /^([^+@]+)(\+[^@]+)?(@.+)$/;
  const match = email.match(emailRegex);
  
  if (!match) {
    return {
      baseEmail: email,
      hasSuffix: false,
      originalEmail: email
    };
  }

  const [, localPart, suffix, domain] = match;
  const baseEmail = `${localPart}${domain}`;
  
  return {
    baseEmail,
    hasSuffix: !!suffix,
    suffix: suffix?.substring(1), // Remove o +
    originalEmail: email
  };
};

export const findRelatedEmails = (emails: string[], targetEmail: string): string[] => {
  const { baseEmail } = parseEmailPattern(targetEmail);
  
  return emails.filter(email => {
    const parsed = parseEmailPattern(email);
    return parsed.baseEmail === baseEmail;
  });
};

export const generateEmailVariations = (baseEmail: string): string[] => {
  const { baseEmail: cleanBase } = parseEmailPattern(baseEmail);
  
  // Gerar possíveis variações que o Supabase pode criar
  const variations = [cleanBase];
  
  // Adicionar algumas variações comuns que o Supabase pode usar
  for (let i = 1; i <= 10; i++) {
    const randomSuffix = Math.floor(Math.random() * 99999);
    variations.push(cleanBase.replace('@', `+${randomSuffix}@`));
  }
  
  return variations;
};

export const normalizeEmailForSearch = (email: string): string => {
  return parseEmailPattern(email).baseEmail;
};
