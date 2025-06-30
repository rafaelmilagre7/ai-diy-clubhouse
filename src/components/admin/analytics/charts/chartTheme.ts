export const chartTheme = {
  colors: {
    primary: '#0ABAB5',
    secondary: '#8B5CF6', 
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    
    // Paleta categórica expandida
    categorical: [
      '#0ABAB5', // Teal
      '#8B5CF6', // Purple
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#3B82F6', // Blue
      '#EC4899', // Pink
      '#F97316', // Orange
      '#06B6D4', // Cyan
      '#8B5A2B'  // Brown
    ],

    // Gradientes para área charts
    gradients: {
      primary: ['#0ABAB5', '#0ABAB520'],
      secondary: ['#8B5CF6', '#8B5CF620'],
      success: ['#10B981', '#10B98120'],
      warning: ['#F59E0B', '#F59E0B20'],
      danger: ['#EF4444', '#EF444420'],
      info: ['#3B82F6', '#3B82F620']
    }
  },

  // Configurações de estilo
  styles: {
    grid: {
      strokeDasharray: '3 3',
      stroke: '#E5E7EB',
      strokeOpacity: 0.5
    },
    
    axis: {
      stroke: '#9CA3AF',
      fontSize: 12,
      fontFamily: 'Inter, sans-serif'
    },

    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '12px',
      fontSize: '14px'
    },

    legend: {
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      color: '#6B7280'
    }
  },

  // Configurações de animação (apenas duração - Recharts não suporta easing customizado)
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
