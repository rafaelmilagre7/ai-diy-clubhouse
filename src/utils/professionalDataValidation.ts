
// Funções de validação para os dados profissionais

export const validateCompanyName = (value: string): string | undefined => {
  if (!value) return "Nome da empresa é obrigatório";
  if (value.length < 2) return "Nome da empresa deve ter pelo menos 2 caracteres";
  return undefined;
};

export const validateWebsite = (value: string): string | undefined => {
  if (!value) return undefined; // Website é opcional
  
  try {
    // Adicionar protocolo se não existir
    const urlString = value.match(/^https?:\/\//) ? value : `https://${value}`;
    
    // Verificar se é uma URL válida
    new URL(urlString);
    
    // Verificar se o domínio parece válido
    if (!urlString.match(/^https?:\/\/[^.]+\.[^.]+/)) {
      return "URL deve incluir um domínio válido";
    }
    
    return undefined;
  } catch (e) {
    return "URL inválida";
  }
};

export const normalizeWebsiteUrl = (value: string): string => {
  if (!value) return "";
  
  // Adicionar protocolo se não existir
  return value.match(/^https?:\/\//) ? value : `https://${value}`;
};

export const validateCompanySize = (value: string): string | undefined => {
  if (!value) return "Tamanho da empresa é obrigatório";
  return undefined;
};

export const validateCompanySector = (value: string): string | undefined => {
  if (!value) return "Setor é obrigatório";
  return undefined;
};

export const validateAnnualRevenue = (value: string): string | undefined => {
  if (!value) return "Faturamento anual é obrigatório";
  return undefined;
};

export const validateCurrentPosition = (value: string): string | undefined => {
  if (!value) return "Cargo atual é obrigatório";
  return undefined;
};

// Função auxiliar para normalizar dados profissionais
export const normalizeProfessionalData = (data: any): any => {
  // Verifica se os dados já estão na estrutura correta
  if (data.professional_info) {
    return data;
  }
  
  // Caso contrário, cria a estrutura esperada
  return {
    professional_info: {
      company_name: data.company_name || "",
      company_size: data.company_size || "",
      company_sector: data.company_sector || "",
      company_website: normalizeWebsiteUrl(data.company_website || ""),
      current_position: data.current_position || "",
      annual_revenue: data.annual_revenue || ""
    }
  };
};

// Função para verificar se todos os campos obrigatórios estão preenchidos
export const hasRequiredProfessionalFields = (data: any): boolean => {
  const info = data.professional_info || data;
  
  return Boolean(
    info.company_name &&
    info.company_size &&
    info.company_sector &&
    info.current_position
  );
};
