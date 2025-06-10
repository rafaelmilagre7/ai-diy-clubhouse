
// Utilitários avançados de validação para gráficos
export interface ChartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: any[];
}

export const validateAreaChartData = (data: any[], index: string, categories: string[]): ChartValidationResult => {
  const result: ChartValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    data: []
  };

  if (!Array.isArray(data)) {
    result.isValid = false;
    result.errors.push('Dados devem ser um array');
    return result;
  }

  if (data.length === 0) {
    result.isValid = false;
    result.errors.push('Array de dados está vazio');
    return result;
  }

  // Validar campos obrigatórios
  const requiredFields = [index, ...categories];
  const validData = data.filter(item => {
    const hasAllFields = requiredFields.every(field => 
      item.hasOwnProperty(field) && item[field] !== undefined && item[field] !== null
    );
    
    if (!hasAllFields) {
      result.warnings.push(`Item ignorado por campos faltantes: ${JSON.stringify(item)}`);
      return false;
    }
    
    return true;
  });

  if (validData.length === 0) {
    result.isValid = false;
    result.errors.push('Nenhum item válido encontrado nos dados');
    return result;
  }

  // Validar tipos de dados numéricos para categories
  const processedData = validData.map(item => {
    const processedItem = { ...item };
    
    categories.forEach(category => {
      const value = item[category];
      if (typeof value === 'string' && !isNaN(Number(value))) {
        processedItem[category] = Number(value);
      } else if (typeof value !== 'number') {
        processedItem[category] = 0;
        result.warnings.push(`Valor não numérico convertido para 0: ${category} = ${value}`);
      }
    });
    
    return processedItem;
  });

  result.data = processedData;
  
  if (result.warnings.length > 0 && result.errors.length === 0) {
    result.isValid = true; // Warnings não invalidam, apenas alertam
  }

  return result;
};

export const validateBarChartData = (data: any[], index: string, categories: string[]): ChartValidationResult => {
  // Mesmo processo de validação do AreaChart
  return validateAreaChartData(data, index, categories);
};

export const validatePieChartData = (data: any[], index: string, category: string): ChartValidationResult => {
  const result: ChartValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    data: []
  };

  if (!Array.isArray(data)) {
    result.isValid = false;
    result.errors.push('Dados devem ser um array');
    return result;
  }

  if (data.length === 0) {
    result.isValid = false;
    result.errors.push('Array de dados está vazio');
    return result;
  }

  const validData = data.filter(item => {
    if (!item.hasOwnProperty(index) || !item.hasOwnProperty(category)) {
      result.warnings.push(`Item ignorado por campos faltantes: ${JSON.stringify(item)}`);
      return false;
    }
    
    const value = item[category];
    if (typeof value !== 'number' && (typeof value !== 'string' || isNaN(Number(value)))) {
      result.warnings.push(`Item ignorado por valor inválido: ${category} = ${value}`);
      return false;
    }
    
    return true;
  });

  if (validData.length === 0) {
    result.isValid = false;
    result.errors.push('Nenhum item válido encontrado nos dados');
    return result;
  }

  // Processar dados para garantir valores numéricos
  const processedData = validData.map(item => ({
    ...item,
    [category]: typeof item[category] === 'string' ? Number(item[category]) : item[category]
  }));

  result.data = processedData;
  return result;
};

// Utilitário para gerar dados de fallback
export const generateFallbackData = (type: 'area' | 'bar' | 'pie', categories: string[] = ['valor']) => {
  const fallbackData = {
    area: [
      { name: 'Jan', valor: 10 },
      { name: 'Fev', valor: 15 },
      { name: 'Mar', valor: 12 },
      { name: 'Abr', valor: 18 }
    ],
    bar: [
      { name: 'Categoria A', valor: 25 },
      { name: 'Categoria B', valor: 15 },
      { name: 'Categoria C', valor: 35 },
      { name: 'Categoria D', valor: 20 }
    ],
    pie: [
      { name: 'Segmento 1', valor: 30 },
      { name: 'Segmento 2', valor: 25 },
      { name: 'Segmento 3', valor: 20 },
      { name: 'Segmento 4', valor: 25 }
    ]
  };

  return fallbackData[type] || fallbackData.bar;
};
