
export const chartTheme = {
  colors: {
    primary: 'hsl(var(--aurora-primary))',
    secondary: 'hsl(262 83% 58%)', 
    success: 'hsl(142 76% 36%)',
    warning: 'hsl(48 96% 53%)',
    danger: 'hsl(var(--destructive))',
    info: 'hsl(221 83% 53%)',
    
    // Paleta categórica expandida usando design system
    categorical: [
      'hsl(var(--aurora-primary))', // Teal principal
      'hsl(262 83% 58%)', // Purple
      'hsl(142 76% 36%)', // Green
      'hsl(48 96% 53%)', // Amber
      'hsl(var(--destructive))', // Red
      'hsl(221 83% 53%)', // Blue
      'hsl(330 81% 60%)', // Pink
      'hsl(25 95% 53%)', // Orange
      'hsl(189 94% 43%)', // Cyan
      'hsl(20 14% 29%)'  // Brown
    ],

    // Gradientes para área charts usando design system
    gradients: {
      primary: ['hsl(var(--aurora-primary))', 'hsl(var(--aurora-primary) / 0.3)'],
      secondary: ['hsl(262 83% 58%)', 'hsl(262 83% 58% / 0.3)'],
      success: ['hsl(142 76% 36%)', 'hsl(142 76% 36% / 0.3)'],
      warning: ['hsl(48 96% 53%)', 'hsl(48 96% 53% / 0.3)'],
      danger: ['hsl(var(--destructive))', 'hsl(var(--destructive) / 0.3)'],
      info: ['hsl(221 83% 53%)', 'hsl(221 83% 53% / 0.3)']
    }
  },

  // Configurações de estilo usando design system
  styles: {
    grid: {
      strokeDasharray: '3 3',
      stroke: 'hsl(var(--border))',
      strokeOpacity: 0.3
    },
    
    axis: {
      stroke: 'hsl(var(--muted-foreground))',
      fontSize: 12,
      fontFamily: 'Inter, sans-serif'
    },

    tooltip: {
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px hsl(var(--foreground) / 0.1)',
      padding: '12px',
      fontSize: '14px',
      color: 'hsl(var(--card-foreground))'
    },

    legend: {
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      color: 'hsl(var(--muted-foreground))'
    }
  },

  // Configurações de animação
  animations: {
    duration: 800,
    delay: 100
  },

  // Configurações responsivas
  responsive: {
    small: {
      height: 200,
      margin: { top: 10, right: 10, bottom: 20, left: 10 }
    },
    medium: {
      height: 300,
      margin: { top: 20, right: 30, bottom: 30, left: 20 }
    },
    large: {
      height: 400,
      margin: { top: 30, right: 40, bottom: 40, left: 30 }
    }
  }
};

// Função para obter cor por índice
export const getChartColor = (index: number): string => {
  return chartTheme.colors.categorical[index % chartTheme.colors.categorical.length];
};

// Função para criar gradiente
export const createGradient = (id: string, colors: string[]) => {
  return `url(#${id})`;
};

// Função para obter configurações responsivas
export const getResponsiveConfig = (size: 'small' | 'medium' | 'large') => {
  return chartTheme.responsive[size];
};
