
// Validações para os componentes de gráfico

export interface ChartValidationResult {
  isValid: boolean;
  data: any[];
  error?: string;
}

export const validateBarChartData = (
  data: any[], 
  index: string, 
  categories: string[]
): ChartValidationResult => {
  if (!data || data.length === 0) {
    return { isValid: false, data: [], error: 'Dados não fornecidos' };
  }

  if (!index || categories.length === 0) {
    return { isValid: false, data: [], error: 'Configuração de gráfico inválida' };
  }

  // Verificar se todos os dados têm as propriedades necessárias
  const validData = data.filter(item => {
    const hasIndex = item && typeof item[index] !== 'undefined';
    const hasCategories = categories.every(cat => typeof item[cat] !== 'undefined');
    return hasIndex && hasCategories;
  });

  if (validData.length === 0) {
    return { isValid: false, data: [], error: 'Nenhum dado válido encontrado' };
  }

  return { isValid: true, data: validData };
};

export const validatePieChartData = (
  data: any[], 
  index: string, 
  category: string
): ChartValidationResult => {
  if (!data || data.length === 0) {
    return { isValid: false, data: [], error: 'Dados não fornecidos' };
  }

  if (!index || !category) {
    return { isValid: false, data: [], error: 'Configuração de gráfico inválida' };
  }

  const validData = data.filter(item => {
    return item && 
           typeof item[index] !== 'undefined' && 
           typeof item[category] !== 'undefined' &&
           !isNaN(Number(item[category]));
  });

  if (validData.length === 0) {
    return { isValid: false, data: [], error: 'Nenhum dado válido encontrado' };
  }

  return { isValid: true, data: validData };
};

export const validateAreaChartData = (
  data: any[], 
  index: string, 
  categories: string[]
): ChartValidationResult => {
  return validateBarChartData(data, index, categories);
};
