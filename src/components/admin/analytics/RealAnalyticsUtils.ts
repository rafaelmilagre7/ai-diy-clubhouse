
// Utilitários para processar dados reais de analytics

export const processUserGrowthData = (rawData: any[]) => {
  if (!rawData || rawData.length === 0) return [];
  
  // Acumular usuários ao longo do tempo
  let totalUsers = 0;
  return rawData.map(item => {
    totalUsers += item.users;
    return {
      date: item.date,
      name: item.name,
      novos: item.users,
      total: totalUsers,
      usuarios: item.users
    };
  });
};

export const processSolutionPerformance = (rawData: any[]) => {
  if (!rawData || rawData.length === 0) return [];
  
  return rawData.slice(0, 5).map(item => ({
    name: item.name,
    value: item.implementations,
    completionRate: item.completionRate
  }));
};

export const processLearningAnalytics = (rawData: any[]) => {
  if (!rawData || rawData.length === 0) return [];
  
  return rawData.map(item => ({
    name: item.courseName,
    enrolled: item.enrolled,
    progress: item.avgProgress,
    value: item.enrolled
  }));
};

export const processWeeklyActivity = (rawData: any[]) => {
  if (!rawData || rawData.length === 0) return [];
  
  // Garantir que todos os dias da semana estejam presentes
  const allDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dataMap = new Map(rawData.map(item => [item.day, item.atividade]));
  
  return allDays.map(day => ({
    day,
    atividade: dataMap.get(day) || 0
  }));
};

export const processRoleDistribution = (rawData: any[]) => {
  if (!rawData || rawData.length === 0) return [];
  
  return rawData.map(item => ({
    role: item.role,
    count: item.count,
    name: item.role === 'admin' ? 'Administrador' :
          item.role === 'member' ? 'Membro' :
          item.role === 'formacao' ? 'Formação' :
          item.role,
    value: item.count
  }));
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getEngagementLevel = (completionRate: number): string => {
  if (completionRate >= 80) return 'Alto';
  if (completionRate >= 50) return 'Médio';
  if (completionRate >= 20) return 'Baixo';
  return 'Muito Baixo';
};

export const getEngagementColor = (completionRate: number): string => {
  // Retorna CSS variables do design system
  if (completionRate >= 80) return 'hsl(var(--engagement-high))'; // verde
  if (completionRate >= 50) return 'hsl(var(--engagement-medium))'; // amarelo
  if (completionRate >= 20) return 'hsl(var(--engagement-low))'; // vermelho
  return 'hsl(var(--engagement-neutral))'; // cinza
};
