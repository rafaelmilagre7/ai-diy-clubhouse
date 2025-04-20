
import { useState, useEffect } from "react";
import { Dashboard, Solution } from "./types";
import { useDashboardData } from "./useDashboardData";
import { useLogging } from "@/contexts/logging";

// Funções para processamento de dados
const sortSolutionsByDifficulty = (solutions: Solution[]): Solution[] => {
  return [...solutions].sort((a, b) => {
    const difficultyMap: {[key: string]: number} = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };
    
    const aDifficulty = a.difficulty ? difficultyMap[a.difficulty.toLowerCase()] || 99 : 99;
    const bDifficulty = b.difficulty ? difficultyMap[b.difficulty.toLowerCase()] || 99 : 99;
    
    return aDifficulty - bDifficulty;
  });
};

// Dados de fallback para quando ocorrer erro
const fallbackSolutionsData: Solution[] = [
  {
    id: 'fallback-1',
    title: 'ChatGPT para Atendimento',
    description: 'Automatize seu atendimento ao cliente usando ChatGPT',
    category: 'Aumento de Receita',
    difficulty: 'beginner',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    slug: 'chatgpt-atendimento'
  },
  {
    id: 'fallback-2',
    title: 'Automação de Email Marketing',
    description: 'Use IA para criar campanhas de email personalizadas',
    category: 'Aumento de Receita',
    difficulty: 'intermediate',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    slug: 'automacao-email-marketing'
  },
  {
    id: 'fallback-3',
    title: 'Otimização de Processos Internos',
    description: 'Elimine tarefas repetitivas com fluxos automatizados',
    category: 'Otimização Operacional',
    difficulty: 'beginner',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    slug: 'otimizacao-processos'
  }
];

// Função para processar dados
const processSolutionsData = (solutions: Solution[], progressData: any[]) => {
  // Criar objeto para mapear o progresso do usuário
  const userProgress: {[key: string]: any} = {};
  
  // Preencher o objeto de progresso
  progressData.forEach(progress => {
    if (!userProgress[progress.solution_id]) {
      userProgress[progress.solution_id] = {
        started: true,
        modules: {},
        lastAccessed: progress.updated_at || progress.created_at,
        completedModules: 0,
        totalModules: 0
      };
    }
    
    // Registrar progresso de módulos
    if (progress.module_id) {
      userProgress[progress.solution_id].modules[progress.module_id] = {
        completed: progress.completed || false,
        lastAccessed: progress.updated_at || progress.created_at
      };
      
      if (progress.completed) {
        userProgress[progress.solution_id].completedModules += 1;
      }
    }
  });
  
  // Classificar soluções
  const activeSolutions: Solution[] = [];
  const completedSolutions: Solution[] = [];
  const availableSolutions: Solution[] = [];
  
  solutions.forEach(solution => {
    // Contar total de módulos para cálculo de progresso
    const totalModules = solution.modules?.length || 0;
    if (userProgress[solution.id]) {
      userProgress[solution.id].totalModules = totalModules;
      
      // Verificar se todos os módulos foram concluídos
      const isComplete = userProgress[solution.id].completedModules >= totalModules && totalModules > 0;
      
      if (isComplete) {
        completedSolutions.push(solution);
      } else {
        activeSolutions.push(solution);
      }
    } else {
      availableSolutions.push(solution);
    }
  });
  
  return {
    userProgress,
    activeSolutions,
    completedSolutions,
    availableSolutions
  };
};

// Default empty state
const DEFAULT_DASHBOARD_STATE: Dashboard = {
  activeSolutions: [],
  completedSolutions: [],
  recommendedSolutions: [],
  allSolutions: [],
  userProgress: {},
  loading: true
};

export const useDashboardProgress = () => {
  const [dashboard, setDashboard] = useState<Dashboard>(DEFAULT_DASHBOARD_STATE);
  const { solutions, progressData, loading, error } = useDashboardData();
  const { log, error: logError } = useLogging();
  
  useEffect(() => {
    if (loading) {
      setDashboard(prev => ({ ...prev, loading: true }));
      return;
    }
    
    try {
      log("Processando dados do dashboard", { 
        solutionsCount: solutions.length,
        progressDataCount: progressData.length 
      });
      
      // Process progress data
      const {
        userProgress,
        activeSolutions,
        completedSolutions,
        availableSolutions
      } = processSolutionsData(solutions, progressData);
      
      // Get recommended solutions - prioritize easier solutions
      const recommendedSolutions = sortSolutionsByDifficulty(availableSolutions).slice(0, 3);
      
      // Update dashboard state
      setDashboard({
        activeSolutions,
        completedSolutions,
        recommendedSolutions,
        allSolutions: solutions,
        userProgress,
        loading: false
      });
      
      log("Dashboard processado com sucesso", {
        active: activeSolutions.length,
        completed: completedSolutions.length,
        recommended: recommendedSolutions.length
      });
    } catch (err) {
      logError("Error processing dashboard data:", err);
      
      // Use fallback data on error
      setDashboard({
        activeSolutions: [],
        completedSolutions: [],
        recommendedSolutions: fallbackSolutionsData.slice(0, 3),
        allSolutions: fallbackSolutionsData,
        userProgress: {},
        loading: false
      });
    }
  }, [solutions, progressData, loading, error, log, logError]);
  
  return dashboard;
};
