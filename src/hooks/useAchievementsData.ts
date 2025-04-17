import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SolutionCategory, toSolutionCategory } from "@/lib/types/categoryTypes";
import { Achievement } from "@/components/achievements/AchievementGrid";

export const useAchievementsData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const [progressData, solutionsData, checklistData, badgesData] = await Promise.all([
          supabase
            .from("progress")
            .select("*, solutions!inner(id, category)")
            .eq("user_id", user.id)
            .then(({ data, error }) => {
              if (error) throw error;
              return data || [];
            }),

          supabase
            .from("solutions")
            .select("*")
            .eq("published", true)
            .then(({ data, error }) => {
              if (error) throw error;
              return data || [];
            }),

          supabase
            .from("user_checklists")
            .select("*")
            .eq("user_id", user.id)
            .then(({ data, error }) => {
              if (error) throw error;
              return data || [];
            }),

          supabase
            .from("user_badges")
            .select("*, badges(*)")
            .eq("user_id", user.id)
            .then(({ data, error }) => {
              if (error && !error.message.includes("relation")) throw error;
              return data || [];
            })
        ]);

        if (progressData && solutionsData) {
          const typedSolutions = solutionsData.map(solution => ({
            ...solution,
            difficulty: solution.difficulty as "easy" | "medium" | "advanced",
            category: toSolutionCategory(solution.category)
          }));

          const generatedAchievements = generateAchievements(
            progressData, 
            typedSolutions,
            checklistData,
            badgesData
          );
          
          setAchievements(generatedAchievements);
          setUserProgress(progressData);
          setSolutions(typedSolutions);
        }
      } catch (error) {
        console.error("Error in fetching achievements data:", error);
        setError("Ocorreu um erro ao carregar suas conquistas");
        toast({
          title: "Erro ao carregar conquistas",
          description: "Ocorreu um erro ao carregar suas conquistas. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, toast]);

  return {
    loading,
    error,
    achievements,
    userProgress,
    solutions
  };
};

const generateAchievements = (
  progress: any[], 
  solutions: Solution[], 
  checklists: any[],
  badges: any[]
): Achievement[] => {
  const achievementsList: Achievement[] = [];

  const solutionCategories = solutions.reduce<Record<string, SolutionCategory>>((acc, solution) => {
    acc[solution.id] = solution.category as SolutionCategory;
    return acc;
  }, {});

  const categoryNames: Record<SolutionCategory, string> = {
    revenue: "Receita",
    operational: "Operacional",
    strategy: "Estratégia",
  };

  const implementationMilestones = [1, 5, 10, 25];
  const completedSolutions = progress.filter(p => p.is_completed).length;

  implementationMilestones.forEach(milestone => {
    achievementsList.push({
      id: `implementation-${milestone}`,
      name: `Implementador Nível ${milestone}`,
      description: `Complete ${milestone} implementações de soluções`,
      category: "achievement",
      isUnlocked: completedSolutions >= milestone,
      earnedAt: completedSolutions >= milestone ? 
        progress.find(p => p.is_completed)?.completed_at : undefined,
      requiredCount: milestone,
      currentCount: completedSolutions,
    });
  });

  Object.entries(categoryNames).forEach(([category, categoryName]) => {
    const completedInCategory = progress.filter(p => {
      const solutionCategory = solutionCategories[p.solution_id];
      return p.is_completed && solutionCategory === category;
    });

    [1, 3, 5].forEach(count => {
      const levelNames = {
        1: "Iniciante",
        3: "Intermediário",
        5: "Especialista"
      };

      achievementsList.push({
        id: `${category}-${count}`,
        name: `${levelNames[count as keyof typeof levelNames]} em ${categoryName}`,
        description: `Complete ${count} soluções na categoria ${categoryName}`,
        category: category as SolutionCategory,
        isUnlocked: completedInCategory.length >= count,
        earnedAt: completedInCategory.length >= count ? 
          completedInCategory[Math.min(count - 1, completedInCategory.length - 1)]?.completed_at : undefined,
        requiredCount: count,
        currentCount: completedInCategory.length,
      });
    });
  });

  const streakLevels = [3, 7, 14, 30];
  const currentStreak = calculateStreak(progress);
  
  streakLevels.forEach(days => {
    achievementsList.push({
      id: `streak-${days}`,
      name: `Sequência de ${days} dias`,
      description: `Mantenha uma sequência de implementação por ${days} dias`,
      category: "achievement",
      isUnlocked: currentStreak >= days,
      requiredCount: days,
      currentCount: currentStreak,
    });
  });

  const fastImplementations = progress.filter(p => {
    const completionTime = new Date(p.completed_at).getTime() - new Date(p.created_at).getTime();
    return completionTime <= 24 * 60 * 60 * 1000; // 24 hours
  }).length;

  if (fastImplementations > 0) {
    achievementsList.push({
      id: "speed-implementation",
      name: "Implementação Relâmpago",
      description: "Complete uma solução em menos de 24 horas",
      category: "achievement",
      isUnlocked: true,
      earnedAt: progress.find(p => p.is_completed)?.completed_at,
    });
  }

  const completedChecklists = checklists.filter(c => {
    const items = Object.values(c.checked_items || {});
    return items.length > 0 && items.every(item => item === true);
  }).length;

  if (completedChecklists > 0) {
    achievementsList.push({
      id: "checklist-master",
      name: "Mestre das Checklists",
      description: "Complete todas as checklists de uma solução",
      category: "achievement",
      isUnlocked: true,
      earnedAt: progress.find(p => p.is_completed)?.completed_at,
    });
  }

  const perfectImplementations = progress.filter(p => {
    const checklist = checklists.find(c => c.solution_id === p.solution_id);
    if (!checklist) return false;
    const items = Object.values(checklist.checked_items || {});
    return p.is_completed && items.length > 0 && items.every(item => item === true);
  }).length;

  if (perfectImplementations > 0) {
    achievementsList.push({
      id: "perfect-implementation",
      name: "Implementação Perfeita",
      description: "Complete uma solução com 100% da checklist",
      category: "achievement",
      isUnlocked: true,
      earnedAt: progress.find(p => p.is_completed)?.completed_at,
    });
  }

  if (progress.some(p => {
    const createdDate = new Date(p.created_at);
    const solutionCreatedDate = solutions.find(s => s.id === p.solution_id)?.created_at;
    if (!solutionCreatedDate) return false;
    return createdDate.getTime() - new Date(solutionCreatedDate).getTime() <= 7 * 24 * 60 * 60 * 1000;
  })) {
    achievementsList.push({
      id: "early-adopter",
      name: "Early Adopter",
      description: "Implemente uma solução na primeira semana de lançamento",
      category: "achievement",
      isUnlocked: true,
    });
  }

  return achievementsList;
};

const calculateStreak = (progress: any[]): number => {
  if (!progress.length) return 0;

  const dates = progress
    .filter(p => p.last_activity)
    .map(p => new Date(p.last_activity).toISOString().split('T')[0])
    .sort();

  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
};
