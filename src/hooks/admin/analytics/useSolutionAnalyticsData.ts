import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Solution } from "@/lib/supabase";

export interface SolutionAnalyticsData {
  totalSolutions: number;
  publishedSolutions: number;
  drafts: number;
  avgCompletionRate: number;
  
  // Dados para gráficos
  popularSolutions: { name: string; value: number }[];
  categoryDistribution: { name: string; value: number }[];
  difficultyDistribution: { name: string; value: number }[];
  completionRates: { name: string; value: number }[];
  
  // Dados brutos para tabela
  solutionsWithMetrics: any[];
  
  // Estado da busca
  loading: boolean;
  error: string | null;
}

export const useSolutionAnalyticsData = (timeRange: string) => {
  const { toast } = useToast();
  const [data, setData] = useState<SolutionAnalyticsData>({
    totalSolutions: 0,
    publishedSolutions: 0,
    drafts: 0,
    avgCompletionRate: 0,
    popularSolutions: [],
    categoryDistribution: [],
    difficultyDistribution: [],
    completionRates: [],
    solutionsWithMetrics: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        // Buscar soluções
        const { data: solutions, error: solutionsError } = await supabase
          .from("solutions")
          .select("*");
        
        if (solutionsError) throw solutionsError;
        
        // Buscar métricas das soluções
        const { data: metrics, error: metricsError } = await supabase
          .from("solution_metrics")
          .select("*");
        
        // Erro silencioso se a tabela não existir
        
        // Buscar progresso dos usuários
        const { data: progress, error: progressError } = await supabase
          .from("progress")
          .select("*");
        
        if (progressError) throw progressError;
        
        // Processar dados
        const processedData = processSolutionData(
          solutions || [], 
          metrics || [], 
          progress || [],
          timeRange
        );
        
        // Corrigido: usar o spread operator com prev para garantir todos os campos
        setData(prev => ({
          ...prev,
          ...processedData,
          loading: false,
          error: null
        }));
        
      } catch (error: any) {
        console.error("Erro ao carregar dados de soluções:", error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message || "Erro ao carregar dados"
        }));
        
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados analíticos das soluções.",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, [timeRange, toast]);
  
  return data;
};

// Função auxiliar para processar os dados das soluções
const processSolutionData = (
  solutions: any[], 
  metrics: any[], 
  progress: any[],
  timeRange: string
): Partial<SolutionAnalyticsData> => {
  // Filtrar por período de tempo se necessário
  const filtered = filterByTimeRange(solutions, progress, timeRange);
  const filteredSolutions = filtered.solutions;
  const filteredProgress = filtered.progress;
  
  // Estatísticas básicas
  const totalSolutions = filteredSolutions.length;
  const publishedSolutions = filteredSolutions.filter(s => s.published).length;
  const drafts = totalSolutions - publishedSolutions;
  
  // Calcular taxa média de conclusão
  const completedImplementations = filteredProgress.filter(p => p.is_completed).length;
  const totalImplementations = filteredProgress.length;
  const avgCompletionRate = totalImplementations > 0 
    ? Math.round((completedImplementations / totalImplementations) * 100) 
    : 0;
  
  // Distribuição por categoria
  const categoryCount: Record<string, number> = {};
  filteredSolutions.forEach(solution => {
    // Usando as categorias atualizadas
    const category = getCategoryText(solution.category);
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });
  
  const categoryDistribution = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value
  }));
  
  // Distribuição por dificuldade
  const difficultyCount: Record<string, number> = {};
  filteredSolutions.forEach(solution => {
    const difficulty = getDifficultyText(solution.difficulty);
    difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1;
  });
  
  const difficultyDistribution = Object.entries(difficultyCount).map(([name, value]) => ({
    name,
    value
  }));
  
  // Soluções populares (baseadas em visualizações)
  const solutionsWithViewsCount = filteredSolutions.map(solution => {
    const solutionMetrics = metrics.find(m => m.solution_id === solution.id) || {};
    const viewCount = solutionMetrics.total_views || 0;
    
    return {
      id: solution.id,
      title: solution.title,
      views: viewCount,
      starts: solutionMetrics.total_starts || 0,
      completions: solutionMetrics.total_completions || 0
    };
  });
  
  const popularSolutions = solutionsWithViewsCount
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map(solution => ({
      name: solution.title,
      value: solution.views
    }));
  
  // Taxas de conclusão por solução
  const completionRatesBySolution: Record<string, { completed: number, total: number }> = {};
  
  filteredProgress.forEach(p => {
    if (!completionRatesBySolution[p.solution_id]) {
      completionRatesBySolution[p.solution_id] = { completed: 0, total: 0 };
    }
    
    completionRatesBySolution[p.solution_id].total++;
    
    if (p.is_completed) {
      completionRatesBySolution[p.solution_id].completed++;
    }
  });
  
  // Mapear IDs de soluções para títulos
  const solutionTitles: Record<string, string> = {};
  filteredSolutions.forEach(s => {
    solutionTitles[s.id] = s.title;
  });
  
  // Calcular taxas de conclusão
  const completionRates = Object.entries(completionRatesBySolution)
    .filter(([_, stats]) => stats.total > 0)
    .map(([solutionId, stats]) => {
      const rate = Math.round((stats.completed / stats.total) * 100);
      return {
        name: solutionTitles[solutionId] || "Solução desconhecida",
        value: rate
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  // Combinar dados para tabela
  const solutionsWithMetrics = filteredSolutions.map(solution => {
    const solutionMetrics = metrics.find(m => m.solution_id === solution.id) || {};
    const progressStats = completionRatesBySolution[solution.id] || { completed: 0, total: 0 };
    const completionRate = progressStats.total > 0
      ? Math.round((progressStats.completed / progressStats.total) * 100)
      : 0;
    
    return {
      ...solution,
      views: solutionMetrics.total_views || 0,
      starts: solutionMetrics.total_starts || 0,
      completions: solutionMetrics.total_completions || 0,
      completionRate,
      categoryName: getCategoryText(solution.category),
      difficultyName: getDifficultyText(solution.difficulty)
    };
  });
  
  return {
    totalSolutions,
    publishedSolutions,
    drafts,
    avgCompletionRate,
    popularSolutions,
    categoryDistribution,
    difficultyDistribution,
    completionRates,
    solutionsWithMetrics
  };
};

// Funções auxiliares
const filterByTimeRange = (solutions: any[], progress: any[], timeRange: string) => {
  // ... keep existing code (filtro por intervalo de tempo)
  if (timeRange === 'all') {
    return { solutions, progress };
  }
  
  const now = new Date();
  let pastDate = new Date();
  
  // Definir data limite com base no intervalo de tempo
  switch (timeRange) {
    case '7d':
      pastDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      pastDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      pastDate.setDate(now.getDate() - 90);
      break;
    default:
      pastDate = new Date(0); // Início dos tempos
  }
  
  // Filtrar soluções criadas no período
  const filteredSolutions = solutions.filter(s => {
    const createdAt = new Date(s.created_at);
    return createdAt >= pastDate;
  });
  
  // Filtrar progresso registrado no período
  const filteredProgress = progress.filter(p => {
    const lastActivity = new Date(p.last_activity);
    return lastActivity >= pastDate;
  });
  
  return { solutions: filteredSolutions, progress: filteredProgress };
};

// Atualizar o mapeamento de categorias para refletir os novos valores no banco de dados
const getCategoryText = (category: string): string => {
  switch (category) {
    case 'revenue': 
    case 'Receita': 
      return 'Aumento de Receita';
    case 'operational': 
    case 'Operacional': 
      return 'Otimização Operacional';
    case 'strategy':
    case 'Estratégia': 
      return 'Gestão Estratégica';
    default: 
      return category || 'Sem categoria';
  }
};

const getDifficultyText = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'Fácil';
    case 'medium': return 'Média';
    case 'hard': return 'Avançada';
    default: return difficulty || 'Não definido';
  }
};
