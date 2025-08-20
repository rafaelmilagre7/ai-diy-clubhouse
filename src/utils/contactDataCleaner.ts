export interface ContactData {
  name: string;
  email: string;
  phone?: string;
  role_id?: string;
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
   * Limpa nome próprio
   */
  private cleanName(name: string): { cleaned: string; corrections: string[] } {
    const corrections: string[] = [];
    let cleaned = name.trim();
    
    if (name !== cleaned) {
      corrections.push('Removidos espaços extras');
    }
    
    // Remove espaços duplos
    const singleSpaced = cleaned.replace(/\s+/g, ' ');
    if (cleaned !== singleSpaced) {
      corrections.push('Corrigidos espaços duplos');
      cleaned = singleSpaced;
    }
    
    // Capitaliza corretamente (primeira letra de cada palavra)
    const capitalized = cleaned.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    
    // Exceções para preposições brasileiras
    const exceptions = ['da', 'de', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos'];
    const words = capitalized.split(' ');
    const correctedWords = words.map((word, index) => {
      // Primeira e última palavra sempre maiúsculas
      if (index === 0 || index === words.length - 1) {
        return word;
      }
      // Preposições em minúsculas
      if (exceptions.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word;
    });
    
    const finalName = correctedWords.join(' ');
    if (cleaned !== finalName) {
      corrections.push('Corrigida capitalização');
      cleaned = finalName;
    }
    
    return { cleaned, corrections };
  }
  
  /**
   * Valida nome (deve ter pelo menos 2 caracteres)
   */
  private validateName(name: string): boolean {
    return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim());
  }
  
  /**
   * Limpa um contato individual
   */
  private cleanContact(contact: ContactData): CleanedContact {
    const corrections: string[] = [];
    const errors: string[] = [];
    
    // Limpa nome
    const nameResult = this.cleanName(contact.name);
    const cleanedName = nameResult.cleaned;
    corrections.push(...nameResult.corrections);
    
    if (!this.validateName(cleanedName)) {
      errors.push('Nome inválido');
    }
    
    // Limpa e-mail
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
    
    const cleaned: ContactData = {
      name: cleanedName,
      email: cleanedEmail,
      phone: cleanedPhone,
      role_id: contact.role_id
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
  public processContacts(contacts: ContactData[]): DataCleaningResult {
    console.log(`🧹 Iniciando limpeza de ${contacts.length} contatos...`);
    
    // Limpa cada contato
    const cleanedContacts = contacts.map(contact => this.cleanContact(contact));
    
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
    
    console.log('📊 Resumo da limpeza:', summary);
    
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