
export const chartColors = {
  primary: 'hsl(var(--aurora-primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--destructive))',
  info: 'hsl(var(--info))',
  categorical: [
    'hsl(var(--aurora-primary))',
    'hsl(var(--secondary))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(var(--destructive))',
    'hsl(var(--info))',
    'hsl(var(--aurora-primary-light))',
    'hsl(var(--accent))'
  ]
};

// Helper para obter cores do design system para gráficos
export const getAuroraChartColors = () => ({
  primary: 'hsl(var(--aurora-primary))',
  primaryLight: 'hsl(var(--aurora-primary-light))',
  primaryDark: 'hsl(var(--aurora-primary-dark))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--destructive))',
  info: 'hsl(var(--info))',
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted-foreground))',
  accent: 'hsl(var(--accent))'
});

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
