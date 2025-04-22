
export const validateCompanyName = (value: string): string | undefined => {
  if (!value) return "Nome da empresa é obrigatório";
  if (value.length < 2) return "Nome da empresa deve ter pelo menos 2 caracteres";
  return undefined;
};

export const validateWebsite = (value: string): string | undefined => {
  if (!value) return undefined; // Website é opcional
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!urlPattern.test(value)) return "URL inválida";
  return undefined;
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
  if (value.length < 2) return "Cargo deve ter pelo menos 2 caracteres";
  return undefined;
};
