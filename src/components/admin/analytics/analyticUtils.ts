
// Funções para processamento de dados de analytics

// Processa dados de crescimento de usuários
export const processUsersByTime = (userData: any[]) => {
  if (userData.length === 0) {
    return generateSampleUserGrowthData();
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
    if (!user.created_at) return;
    
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

// Gerar dados de exemplo para crescimento de usuários
function generateSampleUserGrowthData() {
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  const currentYear = new Date().getFullYear().toString().slice(2);
  
  return monthNames.map((month, index) => ({
    name: `${month}/${currentYear}`,
    total: Math.floor(Math.random() * 50) + 10
  }));
}

// Processa dados de popularidade de soluções
export const processSolutionPopularity = (progressData: any[], solutionsData: any[]) => {
  if (progressData.length === 0 || solutionsData.length === 0) {
    return generateSampleSolutionPopularityData();
  }

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
    .filter(([id]) => solutionMap.has(id)) // Apenas soluções que existem na lista filtrada
    .map(([id, count]) => ({
      name: truncateText(solutionMap.get(id) || `Solução ${id.substring(0, 4)}`, 25),
      value: count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  return result.length > 0 ? result : generateSampleSolutionPopularityData();
};

// Gerar dados de exemplo para popularidade de soluções
function generateSampleSolutionPopularityData() {
  return [
    { name: "Assistente de Atendimento", value: 28 },
    { name: "Automação de Email", value: 22 },
    { name: "Gerador de Conteúdo", value: 18 },
    { name: "Análise de Dados", value: 15 },
    { name: "Chatbot Personalizado", value: 12 }
  ];
}

// Processa implementações por categoria
export const processImplementationsByCategory = (progressData: any[], solutionsData: any[]) => {
  // Mapear soluções por categoria
  const solutionCategories = new Map(solutionsData.map(s => [s.id, s.category]));
  
  // Contar implementações por categoria
  const categoryCounts: Record<string, number> = {
    revenue: 0,
    operational: 0,
    strategy: 0
  };
  
  let hasData = false;
  
  progressData.forEach(progress => {
    if (progress.solution_id) {
      const category = solutionCategories.get(progress.solution_id);
      if (category && categoryCounts[category] !== undefined) {
        categoryCounts[category]++;
        hasData = true;
      }
    }
  });
  
  // Se não tiver dados, gerar dados de exemplo
  if (!hasData) {
    return [
      { name: 'Aumento de Receita', value: 15 },
      { name: 'Otimização Operacional', value: 23 },
      { name: 'Gestão Estratégica', value: 18 }
    ];
  }
  
  // Formatar para gráfico
  return [
    { name: 'Aumento de Receita', value: categoryCounts.revenue },
    { name: 'Otimização Operacional', value: categoryCounts.operational },
    { name: 'Gestão Estratégica', value: categoryCounts.strategy }
  ];
};

// Processa taxa de conclusão
export const processCompletionRate = (progressData: any[]) => {
  if (!progressData || progressData.length === 0) {
    return [
      { name: 'Concluídas', value: 35 },
      { name: 'Em Andamento', value: 65 }
    ];
  }
  
  const total = progressData.length;
  const completed = progressData.filter(p => p.is_completed).length;
  
  return [
    { name: 'Concluídas', value: completed },
    { name: 'Em Andamento', value: total - completed }
  ];
};

// Processa atividade por dia da semana
export const processDayOfWeekActivity = (progressData: any[]) => {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dayCounts = Array(7).fill(0);
  
  // Se não houver dados suficientes, usar dados simulados
  if (progressData.length < 10) {
    return dayNames.map((name) => ({
      name,
      atividade: Math.floor(Math.random() * 15) + 5
    }));
  }
  
  progressData.forEach(progress => {
    if (progress.created_at) {
      try {
        const date = new Date(progress.created_at);
        const day = date.getDay();
        dayCounts[day]++;
      } catch (e) {
        console.error("Erro ao processar data:", e);
      }
    }
  });
  
  return dayNames.map((name, index) => ({
    name,
    atividade: dayCounts[index]
  }));
};

// Função auxiliar para truncar texto
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
