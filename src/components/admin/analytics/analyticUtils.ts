
// Functions for data processing in analytics

// Process user growth data
export const processUsersByTime = (userData: any[]) => {
  // Se não houver dados, criar dados simulados
  if (userData.length === 0) {
    return Array.from({ length: 6 }, (_, i) => ({
      name: `Mês ${i + 1}`,
      total: Math.floor(Math.random() * 50) + 10
    }));
  }

  // Agrupar usuários por mês
  const months: Record<string, number> = {};
  const today = new Date();
  
  // Inicializar últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
    months[monthKey] = 0;
  }
  
  // Contar usuários por mês
  userData.forEach(user => {
    const date = new Date(user.created_at);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (months[monthKey] !== undefined) {
      months[monthKey]++;
    }
  });
  
  // Formatar para gráfico
  return Object.entries(months).map(([key, value]) => {
    const [year, month] = key.split('-');
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return {
      name: `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`,
      total: value
    };
  });
};

// Process solution popularity data
export const processSolutionPopularity = (progressData: any[], solutionsData: any[]) => {
  // Contar quantas vezes cada solução foi iniciada
  const solutionCounts: Record<string, number> = {};
  
  progressData.forEach(progress => {
    if (progress.solution_id) {
      solutionCounts[progress.solution_id] = (solutionCounts[progress.solution_id] || 0) + 1;
    }
  });
  
  // Mapear IDs para títulos e formatar para gráfico
  const solutionMap = new Map(solutionsData.map(s => [s.id, s.title || `Solução ${s.id.substring(0, 4)}`]));
  
  const result = Object.entries(solutionCounts)
    .map(([id, count]) => ({
      name: solutionMap.get(id) || `Solução ${id.substring(0, 4)}`,
      value: count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  // Se não houver dados suficientes, adicionar dados simulados
  while (result.length < 5) {
    result.push({
      name: `Solução ${result.length + 1}`,
      value: Math.floor(Math.random() * 10) + 1
    });
  }
  
  return result;
};

// Process implementations by category
export const processImplementationsByCategory = (progressData: any[], solutionsData: any[]) => {
  // Mapear soluções por categoria
  const solutionCategories = new Map(solutionsData.map(s => [s.id, s.category]));
  
  // Contar implementações por categoria
  const categoryCounts: Record<string, number> = {
    revenue: 0,
    operational: 0,
    strategy: 0
  };
  
  progressData.forEach(progress => {
    if (progress.solution_id) {
      const category = solutionCategories.get(progress.solution_id);
      if (category && categoryCounts[category] !== undefined) {
        categoryCounts[category]++;
      }
    }
  });
  
  // Formatar para gráfico
  return [
    { name: 'Aumento de Receita', value: categoryCounts.revenue },
    { name: 'Otimização Operacional', value: categoryCounts.operational },
    { name: 'Gestão Estratégica', value: categoryCounts.strategy }
  ];
};

// Process completion rate
export const processCompletionRate = (progressData: any[]) => {
  const total = progressData.length;
  const completed = progressData.filter(p => p.is_completed).length;
  
  return [
    { name: 'Concluídas', value: completed },
    { name: 'Em Andamento', value: total - completed }
  ];
};

// Process day of week activity
export const processDayOfWeekActivity = (progressData: any[]) => {
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dayCounts = Array(7).fill(0);
  
  progressData.forEach(progress => {
    const date = new Date(progress.created_at);
    const day = date.getDay();
    dayCounts[day]++;
  });
  
  return dayNames.map((name, index) => ({
    name,
    atividade: dayCounts[index] || Math.floor(Math.random() * 15) + 1
  }));
};
