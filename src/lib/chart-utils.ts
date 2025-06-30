
export const chartColors = {
  primary: '#0ABAB5',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  categorical: [
    '#0ABAB5', '#8B5CF6', '#10B981', '#F59E0B', 
    '#EF4444', '#3B82F6', '#EC4899', '#F97316'
  ]
};

export const formatChartData = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.filter(item => item !== null && item !== undefined);
};

export const validateChartData = (data: any[], requiredFields: string[]): boolean => {
  console.log('🔍 [CHART-VALIDATION] Validando dados:', { 
    dataLength: data?.length, 
    requiredFields,
    sampleData: data?.[0]
  });
  
  if (!Array.isArray(data) || data.length === 0) {
    console.log('❌ [CHART-VALIDATION] Dados inválidos: não é array ou está vazio');
    return false;
  }
  
  // Validação mais flexível - pelo menos um item deve ter pelo menos um campo necessário
  const hasValidItems = data.some(item => {
    if (!item || typeof item !== 'object') return false;
    
    // Se tem pelo menos um campo necessário com valor válido, considera válido
    return requiredFields.some(field => {
      const value = item[field];
      return value !== undefined && value !== null && value !== '';
    });
  });
  
  console.log('✅ [CHART-VALIDATION] Resultado:', hasValidItems);
  return hasValidItems;
};

export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};
