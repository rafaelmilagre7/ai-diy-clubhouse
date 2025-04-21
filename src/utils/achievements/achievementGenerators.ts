
import { Solution } from "@/lib/supabase";
import { ProgressData } from "@/types/achievementTypes";

export const generateImplementationAchievements = (progressData: ProgressData[], solutions: Solution[]) => {
  // Calcular conquistas baseadas em implementações
  const completedCount = progressData.filter(p => p.is_completed).length;
  
  return [
    {
      id: "implementation-1",
      name: "Primeiro Passo",
      description: "Completou sua primeira solução de IA",
      category: "achievement" as const,
      isUnlocked: completedCount >= 1,
      earnedAt: completedCount >= 1 ? new Date().toISOString() : undefined,
      requiredCount: 1,
      currentCount: completedCount
    },
    {
      id: "implementation-3",
      name: "Especialista em IA",
      description: "Completou 3 soluções de IA",
      category: "achievement" as const,
      isUnlocked: completedCount >= 3,
      earnedAt: completedCount >= 3 ? new Date().toISOString() : undefined,
      requiredCount: 3,
      currentCount: completedCount
    },
    {
      id: "implementation-5",
      name: "Mestre em IA",
      description: "Completou 5 soluções de IA",
      category: "achievement" as const,
      isUnlocked: completedCount >= 5,
      earnedAt: completedCount >= 5 ? new Date().toISOString() : undefined,
      requiredCount: 5,
      currentCount: completedCount
    },
    {
      id: "implementation-10",
      name: "Guru de IA",
      description: "Completou 10 soluções de IA",
      category: "achievement" as const,
      isUnlocked: completedCount >= 10,
      earnedAt: completedCount >= 10 ? new Date().toISOString() : undefined,
      requiredCount: 10,
      currentCount: completedCount
    }
  ];
};

export const generateCategoryAchievements = (progressData: ProgressData[], solutions: Solution[]) => {
  // Mapear IDs das soluções para categorias
  const solutionCategories = solutions.reduce((acc, solution) => {
    acc[solution.id] = solution.category;
    return acc;
  }, {} as Record<string, string>);
  
  // Contar soluções completadas por categoria
  const completedByCategory = progressData
    .filter(p => p.is_completed)
    .reduce((acc, progress) => {
      const category = solutionCategories[progress.solution_id];
      if (category) {
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, { revenue: 0, operational: 0, strategy: 0 } as Record<string, number>);
  
  return [
    {
      id: "category-revenue-3",
      name: "Especialista em Receita",
      description: "Completou 3 soluções da trilha de Receita",
      category: "revenue" as const,
      isUnlocked: completedByCategory.revenue >= 3,
      earnedAt: completedByCategory.revenue >= 3 ? new Date().toISOString() : undefined,
      requiredCount: 3,
      currentCount: completedByCategory.revenue
    },
    {
      id: "category-operational-3",
      name: "Especialista em Operações",
      description: "Completou 3 soluções da trilha Operacional",
      category: "operational" as const,
      isUnlocked: completedByCategory.operational >= 3,
      earnedAt: completedByCategory.operational >= 3 ? new Date().toISOString() : undefined,
      requiredCount: 3,
      currentCount: completedByCategory.operational
    },
    {
      id: "category-strategy-3",
      name: "Estrategista de IA",
      description: "Completou 3 soluções da trilha de Estratégia",
      category: "strategy" as const,
      isUnlocked: completedByCategory.strategy >= 3,
      earnedAt: completedByCategory.strategy >= 3 ? new Date().toISOString() : undefined,
      requiredCount: 3,
      currentCount: completedByCategory.strategy
    }
  ];
};

export const generateEngagementAchievements = (progressData: ProgressData[], solutions: Solution[]) => {
  // Calcular tempo total gasto em implementações (em dias)
  const totalDaysEngaged = progressData.reduce((days, progress) => {
    if (progress.created_at && progress.last_activity) {
      const start = new Date(progress.created_at);
      const end = new Date(progress.last_activity);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return days + daysDiff;
    }
    return days;
  }, 0);
  
  return [
    {
      id: "engagement-7days",
      name: "Consistente",
      description: "Engajado por 7 dias nas implementações",
      category: "achievement" as const,
      isUnlocked: totalDaysEngaged >= 7,
      earnedAt: totalDaysEngaged >= 7 ? new Date().toISOString() : undefined,
      requiredCount: 7,
      currentCount: totalDaysEngaged
    },
    {
      id: "engagement-30days",
      name: "Dedicado",
      description: "Engajado por 30 dias nas implementações",
      category: "achievement" as const,
      isUnlocked: totalDaysEngaged >= 30,
      earnedAt: totalDaysEngaged >= 30 ? new Date().toISOString() : undefined,
      requiredCount: 30,
      currentCount: totalDaysEngaged
    }
  ];
};

export const generateSocialAchievements = (
  progressData: ProgressData[], 
  comments: any[] = [], 
  totalLikes: number = 0
) => {
  const commentsCount = comments.length;
  
  return [
    {
      id: "social-comments-5",
      name: "Colaborador",
      description: "Fez 5 comentários em soluções",
      category: "achievement" as const,
      isUnlocked: commentsCount >= 5,
      earnedAt: commentsCount >= 5 ? new Date().toISOString() : undefined,
      requiredCount: 5,
      currentCount: commentsCount
    },
    {
      id: "social-likes-10",
      name: "Influenciador",
      description: "Recebeu 10 likes em seus comentários",
      category: "achievement" as const,
      isUnlocked: totalLikes >= 10,
      earnedAt: totalLikes >= 10 ? new Date().toISOString() : undefined,
      requiredCount: 10,
      currentCount: totalLikes
    }
  ];
};
