
// Utilitários para processamento de dados analytics
export const processUsersByTime = (data: any[]) => {
  if (!data || data.length === 0) return [];
  
  return data.map(item => ({
    date: item.date || item.created_at,
    name: item.name || new Date(item.date || item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    usuarios: item.novos || item.usuarios || 1,
    total: item.total || item.usuarios || 1,
    novos: item.novos || item.usuarios || 1
  }));
};

export const processSolutionPopularity = (progressData: any[], solutionsData: any[]) => {
  if (!progressData || !solutionsData) return [];
  
  const solutionCounts = progressData.reduce((acc: any, progress) => {
    const solutionId = progress.solution_id;
    acc[solutionId] = (acc[solutionId] || 0) + 1;
    return acc;
  }, {});

  return solutionsData
    .map(solution => ({
      name: solution.title?.length > 25 ? solution.title.substring(0, 25) + '...' : solution.title || 'Solução',
      value: solutionCounts[solution.id] || 0
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

export const processImplementationsByCategory = (progressData: any[], solutionsData: any[]) => {
  if (!progressData || !solutionsData) return [];
  
  const categoryMap = solutionsData.reduce((acc: any, solution) => {
    acc[solution.id] = solution.category || 'Outros';
    return acc;
  }, {});

  const categoryCounts = progressData.reduce((acc: any, progress) => {
    const category = categoryMap[progress.solution_id] || 'Outros';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value: value as number
  }));
};

export const processCompletionRate = (progressData: any[]) => {
  if (!progressData || progressData.length === 0) {
    return [
      { name: 'Concluídas', value: 0 },
      { name: 'Em andamento', value: 0 }
    ];
  }
  
  const completed = progressData.filter(p => p.is_completed).length;
  const inProgress = progressData.length - completed;
  
  return [
    { name: 'Concluídas', value: completed },
    { name: 'Em andamento', value: inProgress }
  ];
};

export const processDayOfWeekActivity = (data: any[]) => {
  if (!data || data.length === 0) return [];
  
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const activityByDay = new Array(7).fill(0);
  
  data.forEach(item => {
    const date = new Date(item.created_at || item.last_activity || item.updated_at);
    const dayIndex = date.getDay();
    activityByDay[dayIndex]++;
  });
  
  return dayNames.map((day, index) => ({
    day,
    atividade: activityByDay[index]
  }));
};
