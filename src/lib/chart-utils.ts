
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
  // Propriedades adicionais necessárias
  accent: '#6366F1', // Usando secondary como accent
  categorical: [
    '#0ABAB5', // primary
    '#6366F1', // secondary
    '#10B981', // success
    '#F59E0B', // warning
    '#EF4444', // danger
    '#3B82F6', // info
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#F97316', // orange
    '#14B8A6'  // teal
  ],
  areaGradient: {
    id: 'areaGradient',
    colors: ['#0ABAB5', '#6366F1']
  },
  barGradient: {
    id: 'barGradient', 
    colors: ['#6366F1', '#0ABAB5']
  }
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

// Função para criar gradientes SVG
export const getChartGradient = (id: string, colors: string[]) => {
  return (
    <defs key={id}>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={colors[1] || colors[0]} stopOpacity={0.1}/>
      </linearGradient>
    </defs>
  );
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
  const colors = Object.values(chartColors.categorical);
  return colors[index % colors.length];
};
