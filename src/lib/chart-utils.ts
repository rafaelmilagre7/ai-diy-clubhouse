
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
  teal: '#14B8A6',
  accent: '#6366F1',
  categorical: [
    '#0ABAB5', '#6366F1', '#10B981', '#F59E0B', '#EF4444', 
    '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6'
  ]
} as const;

// Configuração básica para gráficos
export const chartConfig = {
  primary: {
    label: 'Primary',
    color: chartColors.primary
  },
  secondary: {
    label: 'Secondary', 
    color: chartColors.secondary
  }
};

// Configuração por tipo de gráfico
export const chartTypeConfig = {
  area: {
    strokeWidth: 2,
    fillOpacity: 0.8
  },
  bar: {
    radius: 4
  },
  pie: {
    innerRadius: 60,
    outerRadius: 90
  }
};

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
  return chartColors.categorical[index % chartColors.categorical.length];
};

// Formatador de valores padrão
export const defaultValueFormatter = (value: number): string => {
  if (typeof value !== 'number') return String(value);
  return value.toLocaleString('pt-BR');
};

// Formatador de percentual
export const percentFormatter = (value: number): string => {
  if (typeof value !== 'number') return '0%';
  return `${Math.round(value)}%`;
};

// Formatador de usuários
export const userCountFormatter = (value: number): string => {
  if (typeof value !== 'number') return '0 usuários';
  return `${value} usuário${value !== 1 ? 's' : ''}`;
};
