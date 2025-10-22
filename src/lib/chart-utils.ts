
/**
 * Design System Chart Colors
 * Todas as cores são referenciadas via CSS variables para consistência total
 */
export const chartColors = {
  primary: 'hsl(var(--aurora-primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(142 76% 36%)',
  warning: 'hsl(43 96% 56%)',
  danger: 'hsl(var(--destructive))',
  info: 'hsl(221 83% 53%)',
  
  // Paleta categórica alinhada com chartTheme.ts
  categorical: [
    'hsl(var(--aurora-primary))',  // Teal principal
    'hsl(262 83% 58%)',            // Purple
    'hsl(142 76% 36%)',            // Green
    'hsl(48 96% 53%)',             // Amber
    'hsl(var(--destructive))',     // Red
    'hsl(221 83% 53%)',            // Blue
    'hsl(330 81% 60%)',            // Pink
    'hsl(25 95% 53%)',             // Orange
  ],
  
  // Paleta de gradientes para área charts
  gradients: {
    primary: ['hsl(var(--aurora-primary))', 'hsl(var(--aurora-primary) / 0.3)'],
    secondary: ['hsl(262 83% 58%)', 'hsl(262 83% 58% / 0.3)'],
    success: ['hsl(142 76% 36%)', 'hsl(142 76% 36% / 0.3)'],
    warning: ['hsl(48 96% 53%)', 'hsl(48 96% 53% / 0.3)'],
    danger: ['hsl(var(--destructive))', 'hsl(var(--destructive) / 0.3)'],
  }
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
  if (!Array.isArray(data) || data.length === 0) {
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

/**
 * Helper para extrair cores reais do CSS quando necessário
 * Útil para bibliotecas que não suportam CSS variables diretamente
 */
export const getCSSVariableColor = (variableName: string): string => {
  if (typeof window === 'undefined') return '';
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
  return color ? `hsl(${color})` : '';
};

/**
 * Obtém cores do design system extraindo valores CSS
 */
export const getDesignSystemColors = () => ({
  primary: getCSSVariableColor('--aurora-primary'),
  primaryLight: getCSSVariableColor('--aurora-primary-light'),
  primaryDark: getCSSVariableColor('--aurora-primary-dark'),
  success: getCSSVariableColor('--success') || 'hsl(142 76% 36%)',
  warning: getCSSVariableColor('--warning') || 'hsl(43 96% 56%)',
  danger: getCSSVariableColor('--destructive'),
  muted: getCSSVariableColor('--muted-foreground'),
});
