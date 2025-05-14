
/**
 * Funções de validação específicas para dados profissionais
 * Usadas no formulário de Dados Profissionais do onboarding
 */

/**
 * Valida o nome da empresa
 * @param companyName Nome da empresa
 * @returns Mensagem de erro ou null se válido
 */
export const validateCompanyName = (companyName: string): string | null => {
  if (!companyName) {
    return "Nome da empresa é obrigatório";
  }
  
  if (companyName.length < 2) {
    return "Nome da empresa deve ter pelo menos 2 caracteres";
  }
  
  return null;
};

/**
 * Valida o tamanho da empresa
 * @param companySize Tamanho da empresa
 * @returns Mensagem de erro ou null se válido
 */
export const validateCompanySize = (companySize: string): string | null => {
  if (!companySize) {
    return "Tamanho da empresa é obrigatório";
  }
  
  return null;
};

/**
 * Valida o setor da empresa
 * @param companySector Setor da empresa
 * @returns Mensagem de erro ou null se válido
 */
export const validateCompanySector = (companySector: string): string | null => {
  if (!companySector) {
    return "Setor da empresa é obrigatório";
  }
  
  return null;
};

/**
 * Valida o cargo atual do usuário
 * @param currentPosition Cargo atual
 * @returns Mensagem de erro ou null se válido
 */
export const validateCurrentPosition = (currentPosition: string): string | null => {
  if (!currentPosition) {
    return "Cargo atual é obrigatório";
  }
  
  return null;
};

/**
 * Valida a URL do website da empresa
 * @param website URL do website
 * @returns Mensagem de erro ou null se válido
 */
export const validateWebsite = (website: string): string | null => {
  if (!website) {
    return null; // Website é opcional
  }
  
  // Verificação básica de URL
  try {
    // Normalizar a URL primeiro
    const normalizedUrl = normalizeWebsiteUrl(website);
    
    // Tentar criar um objeto URL válido
    new URL(normalizedUrl);
    return null;
  } catch (error) {
    return "URL do website inválida. Use o formato: exemplo.com";
  }
};

/**
 * Normaliza uma URL de website para garantir formato correto
 * @param url URL a ser normalizada
 * @returns URL normalizada
 */
export const normalizeWebsiteUrl = (url: string): string => {
  if (!url) return "";
  
  // Remove espaços extras
  let normalizedUrl = url.trim();
  
  // Remove http:// e https:// para padronização
  normalizedUrl = normalizedUrl.replace(/^(https?:\/\/)?(www\.)?/, "");
  
  // Se não estiver vazio, adiciona https://
  if (normalizedUrl) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  
  return normalizedUrl;
};

/**
 * Valida o faturamento anual
 * @param annualRevenue Valor do faturamento anual
 * @returns true se for válido, false caso contrário
 */
export const validateAnnualRevenue = (annualRevenue: string): boolean => {
  // Verifica se foi selecionado um valor
  return !!annualRevenue && annualRevenue.trim() !== '';
};

