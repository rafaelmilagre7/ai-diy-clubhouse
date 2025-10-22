export interface ContactData {
  email: string;
  phone?: string;
  role?: string;
  channel?: 'email' | 'whatsapp' | 'both';
  expires_in?: string;
  notes?: string;
}

export interface CleanedContact {
  original: ContactData;
  cleaned: ContactData;
  corrections: string[];
  errors: string[];
  status: 'valid' | 'corrected' | 'invalid';
}

export interface DataCleaningResult {
  valid: CleanedContact[];
  corrected: CleanedContact[];
  invalid: CleanedContact[];
  duplicates: CleanedContact[][];
  summary: {
    total: number;
    validCount: number;
    correctedCount: number;
    invalidCount: number;
    duplicateCount: number;
  };
}

class ContactDataCleaner {
  
  /**
   * Limpa e-mail removendo espaços e convertendo para lowercase
   */
  private cleanEmail(email: string): { cleaned: string; corrections: string[] } {
    const corrections: string[] = [];
    let cleaned = email.trim();
    
    if (email !== cleaned) {
      corrections.push('Removidos espaços extras');
    }
    
    const lowercased = cleaned.toLowerCase();
    if (cleaned !== lowercased) {
      corrections.push('Convertido para minúsculas');
      cleaned = lowercased;
    }
    
    return { cleaned, corrections };
  }
  
  /**
   * Valida formato de e-mail
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Limpa e formata número de telefone brasileiro
   */
  private cleanPhone(phone: string): { cleaned: string; corrections: string[] } {
    const corrections: string[] = [];
    
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    if (phone !== phone.replace(/\D/g, '')) {
      corrections.push('Removidos caracteres especiais');
    }
    
    // Adiciona código do país se não tiver
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
      // Número com DDD mas sem código do país
      cleaned = '55' + cleaned;
      corrections.push('Adicionado código do país (+55)');
    } else if (cleaned.length === 10) {
      // Número sem nono dígito
      if (cleaned.startsWith('11')) {
        cleaned = '5511' + '9' + cleaned.substring(2);
        corrections.push('Adicionado 9º dígito e código do país');
      }
    } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
      // Já tem código do país
      // OK
    } else if (cleaned.length === 12 && !cleaned.startsWith('55')) {
      // Pode ter código do país diferente ou estar mal formatado
      corrections.push('Formato de telefone pode estar incorreto');
    }
    
    // Formata como +55XXXXXXXXXXX
    if (cleaned.length >= 12 && cleaned.startsWith('55')) {
      cleaned = '+' + cleaned;
      corrections.push('Formatado como +55XXXXXXXXXXX');
    }
    
    return { cleaned, corrections };
  }
  
  /**
   * Valida número de telefone brasileiro
   */
  private validatePhone(phone: string): boolean {
    // Deve ter o formato +55XXXXXXXXXXX (13 dígitos com +)
    const phoneRegex = /^\+55\d{10,11}$/;
    return phoneRegex.test(phone);
  }
  
  /**
   * Valida papel (roles reais do sistema)
   */
  private validateRole(role: string, validRoles?: string[]): boolean {
    const defaultValidRoles = ['admin', 'convidado', 'hands_on', 'lovable_course'];
    const rolesToCheck = validRoles && validRoles.length > 0 ? validRoles : defaultValidRoles;
    
    return rolesToCheck.includes(role.toLowerCase());
  }
  
  /**
   * Valida canal de envio
   */
  private validateChannel(channel: string): boolean {
    const validChannels = ['email', 'whatsapp', 'both'];
    return validChannels.includes(channel.toLowerCase());
  }
  
  /**
   * Valida validade do convite
   */
  private validateExpiresIn(expiresIn: string): boolean {
    const validExpiries = ['1 day', '3 days', '7 days', '14 days', '30 days'];
    return validExpiries.includes(expiresIn.toLowerCase());
  }
  
  /**
   * Limpa um contato individual
   */
  private cleanContact(contact: ContactData, validRoles?: string[]): CleanedContact {
    const corrections: string[] = [];
    const errors: string[] = [];
    
    // Limpa e-mail (obrigatório)
    const emailResult = this.cleanEmail(contact.email);
    const cleanedEmail = emailResult.cleaned;
    corrections.push(...emailResult.corrections);
    
    if (!this.validateEmail(cleanedEmail)) {
      errors.push('E-mail inválido');
    }
    
    // Limpa telefone se fornecido
    let cleanedPhone = contact.phone;
    if (contact.phone) {
      const phoneResult = this.cleanPhone(contact.phone);
      cleanedPhone = phoneResult.cleaned;
      corrections.push(...phoneResult.corrections);
      
      if (!this.validatePhone(phoneResult.cleaned)) {
        errors.push('Telefone inválido');
      }
    }
    
    // Valida papel se fornecido
    let cleanedRole = contact.role?.toLowerCase() || 'convidado';
    if (contact.role && !this.validateRole(contact.role, validRoles)) {
      const rolesList = validRoles?.join(', ') || 'admin, convidado, hands_on, lovable_course';
      errors.push(`Papel inválido. Valores aceitos: ${rolesList}`);
    }
    
    // Valida canal se fornecido
    let cleanedChannel = (contact.channel?.toLowerCase() || 'email') as 'email' | 'whatsapp' | 'both';
    if (contact.channel && !this.validateChannel(contact.channel)) {
      errors.push('Canal inválido (email, whatsapp, both)');
    }
    
    // Valida validade se fornecida
    let cleanedExpiresIn = contact.expires_in?.toLowerCase() || '7 days';
    if (contact.expires_in && !this.validateExpiresIn(contact.expires_in)) {
      errors.push('Validade inválida (1 day, 3 days, 7 days, 14 days, 30 days)');
    }
    
    // Verifica se telefone é necessário para WhatsApp
    if ((cleanedChannel === 'whatsapp' || cleanedChannel === 'both') && !cleanedPhone) {
      errors.push('Telefone obrigatório para envio via WhatsApp');
    }
    
    const cleaned: ContactData = {
      email: cleanedEmail,
      phone: cleanedPhone,
      role: cleanedRole,
      channel: cleanedChannel,
      expires_in: cleanedExpiresIn,
      notes: contact.notes?.trim() || undefined
    };
    
    let status: 'valid' | 'corrected' | 'invalid' = 'valid';
    if (errors.length > 0) {
      status = 'invalid';
    } else if (corrections.length > 0) {
      status = 'corrected';
    }
    
    return {
      original: contact,
      cleaned,
      corrections: corrections.filter(Boolean),
      errors,
      status
    };
  }
  
  /**
   * Detecta duplicatas baseado em e-mail
   */
  private findDuplicates(contacts: CleanedContact[]): CleanedContact[][] {
    const emailMap = new Map<string, CleanedContact[]>();
    
    // Agrupa por e-mail
    contacts.forEach(contact => {
      const email = contact.cleaned.email.toLowerCase();
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email)!.push(contact);
    });
    
    // Retorna apenas grupos com mais de 1 contato
    return Array.from(emailMap.values()).filter(group => group.length > 1);
  }
  
  /**
   * Processa lista de contatos e retorna resultado da limpeza
   */
  public processContacts(contacts: ContactData[], validRoles?: string[]): DataCleaningResult {
    // Limpa cada contato
    const cleanedContacts = contacts.map(contact => this.cleanContact(contact, validRoles));
    
    // Separa por status
    const valid = cleanedContacts.filter(c => c.status === 'valid');
    const corrected = cleanedContacts.filter(c => c.status === 'corrected');
    const invalid = cleanedContacts.filter(c => c.status === 'invalid');
    
    // Detecta duplicatas
    const duplicates = this.findDuplicates(cleanedContacts.filter(c => c.status !== 'invalid'));
    
    const summary = {
      total: contacts.length,
      validCount: valid.length,
      correctedCount: corrected.length,
      invalidCount: invalid.length,
      duplicateCount: duplicates.reduce((acc, group) => acc + group.length, 0)
    };
    
    return {
      valid,
      corrected,
      invalid,
      duplicates,
      summary
    };
  }
}

export const contactDataCleaner = new ContactDataCleaner();