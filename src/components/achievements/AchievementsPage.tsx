
import { useUserStats } from "@/hooks/useUserStats/useUserStats";
import { Achievement } from "@/types/achievementTypes";
import { AchievementsHeader } from "./AchievementsHeader";
import { AchievementsProgressCard } from "./AchievementsProgressCard";
import { AchievementsTabsContainer } from "./AchievementsTabsContainer";

// Função utilitária (mock) — manter por compatibilidade, pode ser depois substituída
const getAchievementsList = (stats: any): Achievement[] => [
  {
    id: "beginner-1",
    name: "Pioneiro Digital",
    description: "Completou sua primeira implementação de solução",
    icon: "award",
    category: "achievement",
    requiredCount: 1,
    currentCount: stats.completedSolutions,
    isUnlocked: stats.completedSolutions > 0,
    earnedAt: stats.completedSolutions > 0 ? "2023-10-15" : undefined,
  },
  {
    id: "intermediate-5",
    name: "Implementador Ávido",
    description: "Completou 5 implementações de soluções",
    icon: "trophy",
    category: "achievement",
    requiredCount: 5,
    currentCount: stats.completedSolutions,
    isUnlocked: stats.completedSolutions >= 5,
    earnedAt: stats.completedSolutions >= 5 ? "2023-11-03" : undefined,
  },
  {
    id: "advanced-10",
    name: "Mestre em IA",
    description: "Completou 10 implementações de soluções",
    icon: "star",
    category: "achievement",
    requiredCount: 10,
    currentCount: stats.completedSolutions,
    isUnlocked: stats.completedSolutions >= 10,
    earnedAt: stats.completedSolutions >= 10 ? "2023-12-20" : undefined,
  },
  {
    id: "revenue-3",
    name: "Especialista em Receita",
    description: "Implementou 3 soluções da categoria Receita",
    icon: "bar-chart-3",
    category: "revenue",
    requiredCount: 3,
    currentCount: stats.categoryDistribution.revenue.completed,
    isUnlocked: stats.categoryDistribution.revenue.completed >= 3,
    earnedAt: stats.categoryDistribution.revenue.completed >= 3 ? "2024-01-05" : undefined,
  },
  {
    id: "operational-3",
    name: "Guru Operacional",
    description: "Implementou 3 soluções da categoria Operacional",
    icon: "check-circle",
    category: "operational",
    requiredCount: 3,
    currentCount: stats.categoryDistribution.operational.completed,
    isUnlocked: stats.categoryDistribution.operational.completed >= 3,
    earnedAt: stats.categoryDistribution.operational.completed >= 3 ? "2024-02-10" : undefined,
  },
  {
    id: "strategy-3",
    name: "Estrategista Digital",
    description: "Implementou 3 soluções da categoria Estratégia",
    icon: "sparkles",
    category: "strategy",
    requiredCount: 3,
    currentCount: stats.categoryDistribution.strategy.completed,
    isUnlocked: stats.categoryDistribution.strategy.completed >= 3,
    earnedAt: stats.categoryDistribution.strategy.completed >= 3 ? "2024-03-15" : undefined,
  },
  {
    id: "engagement-7",
    name: "Constância é Tudo",
    description: "Acessou a plataforma por 7 dias consecutivos",
    icon: "calendar",
    category: "achievement",
    requiredCount: 7,
    currentCount: stats.activeDays,
    isUnlocked: stats.activeDays >= 7,
    earnedAt: stats.activeDays >= 7 ? "2024-04-01" : undefined,
  },
];

export const AchievementsPage = () => {
  const { stats, loading } = useUserStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-viverblue animate-spin"></div>
      </div>
    );
  }

  const achievements: Achievement[] = getAchievementsList(stats);

  return (
    <div className="space-y-8 animate-fade-in">
      <AchievementsHeader />
      <AchievementsProgressCard achievements={achievements} />
      <AchievementsTabsContainer achievements={achievements} />
    </div>
  );
};
