
/**
 * Normaliza URLs de websites garantindo que tenham um protocolo válido
 */
export function normalizeWebsite(website: string): string {
  if (!website || typeof website !== 'string') return "";
  
  // Remover espaços em branco no início e no fim
  let url = website.trim();
  
  if (!url) return "";
  
  // Se não tem protocolo, adiciona https://
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`;
  }
  
  try {
    // Validar se é uma URL válida usando o construtor URL
    new URL(url);
    return url;
  } catch (e) {
    // Se não é uma URL válida, retorna o original com https://
    return `https://${website.trim()}`;
  }
}

/**
 * Remove caracteres especiais de um número de telefone
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  
  // Remove todos os caracteres não numéricos
  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Normaliza dados de formulário para serem salvos no banco de dados
 */
export function normalizeFormData(data: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value === undefined || value === null) {
      normalized[key] = null;
      return;
    }
    
    if (key === 'company_website' || key === 'website') {
      normalized[key] = normalizeWebsite(value);
    } else if (key === 'phone') {
      normalized[key] = normalizePhone(value);
    } else if (Array.isArray(value)) {
      normalized[key] = [...value]; // Criar uma cópia do array
    } else if (typeof value === 'object') {
      normalized[key] = { ...value }; // Criar uma cópia do objeto
    } else {
      normalized[key] = value;
    }
  });
  
  return normalized;
}
