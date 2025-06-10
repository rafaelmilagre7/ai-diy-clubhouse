
// Cores e utilitários para gráficos
export const chartColors = {
  primary: '#0ABAB5',
  secondary: '#6366F1', 
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  teal: '#14B8A6'
} as const;

// Função para validar dados de gráfico
export const validateChartData = (data: any[], requiredFields: string[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }
  
  return data.every(item => 
    requiredFields.every(field => 
      item.hasOwnProperty(field) && item[field] !== undefined && item[field] !== null
    )
  );
};

// Função para formatar dados de gráfico
export const formatChartData = (data: any[], defaultValue: any[] = []): any[] => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return defaultValue;
  }
  return data;
};

// Cores para diferentes tipos de dados
export const getDataColor = (index: number): string => {
  const colors = Object.values(chartColors);
  return colors[index % colors.length];
};
