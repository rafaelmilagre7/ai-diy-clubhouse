
/**
 * Normaliza URLs de websites para garantir formato uniforme
 * Adiciona prefixo 'https://' se não houver protocolo especificado
 */
export function normalizeWebsite(url: string): string {
  if (!url) return '';
  
  // Remover espaços em branco
  url = url.trim();
  
  // Se já começar com http:// ou https://, retornar como está
  if (url.match(/^https?:\/\//i)) {
    return url;
  }
  
  // Caso contrário, adicionar https://
  return `https://${url}`;
}

/**
 * Normaliza números de telefone para formato padrão
 * (Adicionar conforme necessário)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remover tudo exceto números
  return phone.replace(/\D/g, '');
}

/**
 * Normaliza nomes de empresas (exemplo)
 * (Adicionar conforme necessário)
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  
  // Remover espaços extras
  return name.trim();
}
