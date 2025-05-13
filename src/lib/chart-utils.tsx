
import React from 'react';
import { theme } from '@/lib/theme';

export const chartColors = {
  // Cores principais baseadas no tema
  primary: theme.colors.primary,
  primaryLight: theme.colors.primaryLight,
  primaryDark: theme.colors.primaryDark,
  secondary: theme.colors.secondary,
  accent: theme.colors.accent,
  success: theme.colors.success,
  error: theme.colors.error,
  warning: theme.colors.warning,
  info: theme.colors.info,
  
  // Paletas para diferentes tipos de dados
  categorical: [
    theme.colors.primary,
    theme.colors.accent,
    theme.colors.secondary,
    theme.colors.info,
    theme.colors.success,
    theme.colors.warning,
  ],
  
  // Paleta para gráficos sequenciais
  sequential: [
    theme.colors.primaryLight,
    theme.colors.primary,
    theme.colors.primaryDark,
  ],
  
  // Paleta para gráficos divergentes
  divergent: [
    theme.colors.error,
    theme.colors.warning,
    theme.colors.success,
  ],
  
  // Gradientes para áreas
  areaGradient: {
    id: "areaGradient",
    colors: [
      { offset: "0%", color: `${theme.colors.primary}50` },
      { offset: "100%", color: `${theme.colors.primary}05` },
    ]
  },
  
  // Gradientes para barras
  barGradient: {
    id: "barGradient",
    colors: [
      { offset: "0%", color: theme.colors.primary },
      { offset: "100%", color: theme.colors.primaryLight },
    ]
  }
};

export const chartConfig = {
  // Configurações globais de estilo para gráficos
  defaultProps: {
    stroke: theme.colors.primary,
    strokeWidth: 2,
    animationDuration: 300,
    animationEasing: "ease-in-out",
  },
  
  // Formatador de números padrão
  defaultNumberFormatter: (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  },
  
  // Configurações para cards de gráficos
  cardStyles: {
    shadowClass: "shadow-md hover:shadow-lg",
    transitionClass: "transition-all duration-300",
    borderClass: "border border-gray-100 dark:border-gray-800",
    glassClass: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
  },
  
  // Formatadores específicos
  formatters: {
    percentage: (value: number) => `${value.toFixed(1)}%`,
    currency: (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`,
    decimal: (value: number) => value.toFixed(1),
    integer: (value: number) => Math.round(value).toString(),
    compact: (value: number) => {
      return Intl.NumberFormat('pt-BR', {
        notation: 'compact',
        compactDisplay: 'short'
      }).format(value);
    }
  }
};

// Componente de gradiente reutilizável para gráficos Recharts
export const getChartGradient = (id: string, colors: { offset: string, color: string }[]) => {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      {colors.map((color, index) => (
        <stop
          key={`${id}-stop-${index}`}
          offset={color.offset}
          stopColor={color.color}
        />
      ))}
    </linearGradient>
  );
};

// Estilos comuns para tooltips personalizados
export const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: `1px solid ${theme.colors.borderLight}`,
  borderRadius: '6px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  padding: '8px 12px',
  fontSize: '12px',
  color: theme.colors.textPrimary,
};

// Configurações específicas para diferentes tipos de gráficos
export const chartTypeConfig = {
  area: {
    stroke: theme.colors.primary,
    fill: `url(#${chartColors.areaGradient.id})`,
    activeDot: {
      r: 6,
      stroke: theme.colors.primary,
      strokeWidth: 2,
      fill: '#fff',
    }
  },
  bar: {
    fill: `url(#${chartColors.barGradient.id})`,
    radius: [4, 4, 0, 0],
    barSize: 30,
  },
  pie: {
    innerRadius: 60,
    outerRadius: 90,
    paddingAngle: 2,
    cornerRadius: 4,
    startAngle: 90,
    endAngle: -270,
    legendLayout: 'horizontal',
  }
};
