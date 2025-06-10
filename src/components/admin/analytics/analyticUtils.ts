
// Utilitários para processamento de dados de analytics

export const processUsersByTime = (users: any[]) => {
  if (!users || users.length === 0) return [];
  
  const grouped = users.reduce((acc, user) => {
    const date = new Date(user.created_at).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(grouped)
    .map(([date, count]) => ({ 
      date, 
      usuarios: count,
      name: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const processSolutionPopularity = (progress: any[], solutions: any[]) => {
  if (!progress || !solutions || progress.length === 0) return [];
  
  const solutionMap = solutions.reduce((acc, solution) => {
    acc[solution.id] = solution;
    return acc;
  }, {});
  
  const grouped = progress.reduce((acc, item) => {
    const solution = solutionMap[item.solution_id];
    if (solution) {
      const title = solution.title || 'Solução sem título';
      acc[title] = (acc[title] || 0) + 1;
    }
    return acc;
  }, {});
  
  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 10); // Top 10
};

export const processImplementationsByCategory = (progress: any[], solutions: any[]) => {
  if (!progress || !solutions || progress.length === 0) return [];
  
  const solutionMap = solutions.reduce((acc, solution) => {
    acc[solution.id] = solution;
    return acc;
  }, {});
  
  const grouped = progress.reduce((acc, item) => {
    const solution = solutionMap[item.solution_id];
    if (solution && item.is_completed) {
      const category = solution.category || 'Outros';
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {});
  
  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }));
};

export const processCompletionRate = (progress: any[]) => {
  if (!progress || progress.length === 0) return [];
  
  const total = progress.length;
  const completed = progress.filter(item => item.is_completed).length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  return [
    { name: 'Concluídas', value: completed },
    { name: 'Em andamento', value: total - completed }
  ];
};

export const processDayOfWeekActivity = (progress: any[]) => {
  if (!progress || progress.length === 0) return [];
  
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const grouped = progress.reduce((acc, item) => {
    const dayIndex = new Date(item.created_at).getDay();
    const dayName = dayNames[dayIndex];
    acc[dayName] = (acc[dayName] || 0) + 1;
    return acc;
  }, {});
  
  return dayNames.map(day => ({
    day,
    atividade: grouped[day] || 0
  }));
};
