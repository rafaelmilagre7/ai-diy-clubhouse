
import React from 'react';

// Cores usando variáveis CSS padronizadas
export const chartColors = {
  // Cores principais baseadas no design system
  primary: 'hsl(var(--viverblue))',
  primaryLight: 'hsl(var(--viverblue-light))',
  primaryDark: 'hsl(var(--viverblue-dark))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(142 76% 36%)',
  error: 'hsl(var(--destructive))',
  warning: 'hsl(48 96% 53%)',
  info: 'hsl(221 83% 53%)',
  
  // Paletas para diferentes tipos de dados
  categorical: [
    'hsl(var(--viverblue))',
    'hsl(262 83% 58%)',
    'hsl(142 76% 36%)',
    'hsl(48 96% 53%)',
    'hsl(var(--destructive))',
    'hsl(221 83% 53%)',
  ],
  
  // Paleta para gráficos sequenciais
  sequential: [
    'hsl(var(--viverblue-light))',
    'hsl(var(--viverblue))',
    'hsl(var(--viverblue-dark))',
  ],
  
  // Paleta para gráficos divergentes
  divergent: [
    'hsl(var(--destructive))',
    'hsl(48 96% 53%)',
    'hsl(142 76% 36%)',
  ],
  
  // Gradientes para áreas
  areaGradient: {
    id: "areaGradient",
    colors: [
      { offset: "0%", color: 'hsl(var(--viverblue) / 0.3)' },
      { offset: "100%", color: 'hsl(var(--viverblue) / 0.05)' },
    ]
  },
  
  // Gradientes para barras
  barGradient: {
    id: "barGradient",
    colors: [
      { offset: "0%", color: 'hsl(var(--viverblue))' },
      { offset: "100%", color: 'hsl(var(--viverblue-light))' },
    ]
  }
};

export const chartConfig = {
  // Configurações globais de estilo para gráficos
  defaultProps: {
    stroke: 'hsl(var(--viverblue))',
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
    borderClass: "border border-border",
    glassClass: "bg-card/80 backdrop-blur-sm",
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
  backgroundColor: 'hsl(var(--card) / 0.95)',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  boxShadow: '0 2px 10px hsl(var(--foreground) / 0.1)',
  padding: '8px 12px',
  fontSize: '12px',
  color: 'hsl(var(--card-foreground))',
};

// Configurações específicas para diferentes tipos de gráficos
export const chartTypeConfig = {
  area: {
    stroke: 'hsl(var(--viverblue))',
    fill: `url(#${chartColors.areaGradient.id})`,
    activeDot: {
      r: 6,
      stroke: 'hsl(var(--viverblue))',
      strokeWidth: 2,
      fill: 'hsl(var(--card))',
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
