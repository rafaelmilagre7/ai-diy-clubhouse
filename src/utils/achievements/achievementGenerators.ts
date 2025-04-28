
import { v4 as uuidv4 } from "uuid";
import { Achievement, ProgressData, getSolutionCategory } from "@/types/achievementTypes";
import { Solution } from "@/lib/supabase";
import { SolutionCategory } from "@/lib/types/categoryTypes";

// Helper para criar conquistas
const createAchievement = (
  name: string, 
  description: string, 
  category: "achievement" | SolutionCategory, 
  requiredCount: number,
  currentCount: number,
  level: number = 1
): Achievement => {
  const isUnlocked = currentCount >= requiredCount;
  
  return {
    id: uuidv4(),
    name,
    description,
    category,
    requiredCount,
    currentCount,
    isUnlocked,
    earnedAt: isUnlocked ? new Date().toISOString() : undefined,
    level
  };
};

// Conquistas baseadas em implementações gerais
export const generateImplementationAchievements = (progress: ProgressData[], solutions: Solution[]): Achievement[] => {
  const completedCount = progress.filter(p => p.is_completed).length;
  const inProgressCount = progress.filter(p => !p.is_completed && p.current_module > 0).length;
  
  return [
    createAchievement(
      "Pioneiro Digital",
      "Completou sua primeira implementação",
      "achievement",
      1,
      completedCount,
      1
    ),
    createAchievement(
      "Implementador Consistente",
      "Completou 5 implementações",
      "achievement",
      5,
      completedCount,
      2
    ),
    createAchievement(
      "Mestre em Implementação",
      "Completou 10 implementações",
      "achievement",
      10,
      completedCount,
      3
    ),
    createAchievement(
      "Iniciando o Percurso",
      "Iniciou 3 soluções diferentes",
      "achievement",
      3,
      inProgressCount + completedCount,
      1
    )
  ];
};

// Conquistas baseadas em categorias específicas
export const generateCategoryAchievements = (progress: ProgressData[], solutions: Solution[]): Achievement[] => {
  const getCompletedByCategory = (category: string) => {
    return progress.filter(p => 
      p.is_completed && 
      getSolutionCategory(p.solutions) === category
    ).length;
  };
  
  const revenueCompleted = getCompletedByCategory("revenue");
  const operationalCompleted = getCompletedByCategory("operational");
  const strategyCompleted = getCompletedByCategory("strategy");
  
  return [
    createAchievement(
      "Especialista em Receita",
      "Implementou 3 soluções da trilha de Receita",
      "revenue",
      3,
      revenueCompleted,
      2
    ),
    createAchievement(
      "Guru Operacional",
      "Implementou 3 soluções da trilha Operacional",
      "operational",
      3,
      operationalCompleted,
      2
    ),
    createAchievement(
      "Estrategista Digital",
      "Implementou 3 soluções da trilha de Estratégia",
      "strategy",
      3,
      strategyCompleted,
      2
    ),
    createAchievement(
      "Multi-Especialista",
      "Implementou ao menos 1 solução de cada trilha",
      "achievement",
      3,
      (revenueCompleted > 0 ? 1 : 0) + 
      (operationalCompleted > 0 ? 1 : 0) + 
      (strategyCompleted > 0 ? 1 : 0),
      3
    )
  ];
};

// Conquistas baseadas em engajamento na plataforma
export const generateEngagementAchievements = (progress: ProgressData[], solutions: Solution[]): Achievement[] => {
  // Para produção, deveríamos ter dados mais precisos sobre logins, tempo, etc.
  // Por enquanto, usamos os dados de progresso como proxy
  
  const totalInteractions = progress.length;
  const avgProgress = progress.reduce((sum, p) => sum + p.current_module, 0) / Math.max(1, progress.length);
  
  // Assumindo uma estimativa simplificada de dias ativos
  const activeDays = Math.min(15, Math.ceil(totalInteractions / 2));
  
  return [
    createAchievement(
      "Constância é Tudo",
      "Acessou a plataforma por 7 dias",
      "achievement",
      7,
      activeDays,
      1
    ),
    createAchievement(
      "Membro Dedicado",
      "Acessou a plataforma por 15 dias",
      "achievement",
      15,
      activeDays,
      2
    ),
    createAchievement(
      "Explorador Completo",
      "Interagiu com pelo menos 10 soluções diferentes",
      "achievement",
      10,
      totalInteractions,
      2
    )
  ];
};

// Conquistas baseadas em interação social (comentários, curtidas)
export const generateSocialAchievements = (
  progress: ProgressData[], 
  comments: any[], 
  totalLikes: number
): Achievement[] => {
  return [
    createAchievement(
      "Comentarista Iniciante",
      "Fez seu primeiro comentário em uma solução",
      "achievement",
      1,
      comments.length,
      1
    ),
    createAchievement(
      "Comentarista Ativo",
      "Fez 5 comentários em soluções",
      "achievement",
      5,
      comments.length,
      2
    ),
    createAchievement(
      "Conteúdo Valioso",
      "Recebeu 5 curtidas em seus comentários",
      "achievement",
      5,
      totalLikes,
      2
    )
  ];
};
