import { Achievement, ProgressData, BadgeData } from "@/types/achievementTypes";
import { Solution } from "@/lib/supabase";
import { SolutionCategory } from "@/lib/types/categoryTypes";

const categoryNames: Record<SolutionCategory, string> = {
  revenue: "Receita",
  operational: "Operacional",
  strategy: "Estratégia",
};

export const generateImplementationAchievements = (
  progress: ProgressData[],
  solutions: Solution[]
): Achievement[] => {
  const achievementsList: Achievement[] = [];
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

  return achievementsList;
};

export const generateCategoryAchievements = (
  progress: ProgressData[],
  solutions: Solution[]
): Achievement[] => {
  const achievementsList: Achievement[] = [];
  const solutionCategories = solutions.reduce<Record<string, SolutionCategory>>((acc, solution) => {
    acc[solution.id] = solution.category as SolutionCategory;
    return acc;
  }, {});

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

  return achievementsList;
};

export const generateEngagementAchievements = (
  progress: ProgressData[],
  solutions: Solution[]
): Achievement[] => {
  const achievementsList: Achievement[] = [];
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

  return achievementsList;
};

export const generateSocialAchievements = (
  progress: ProgressData[],
  comments: any[],
  likes: number
): Achievement[] => {
  const achievementsList: Achievement[] = [];
  
  // Conquistas de comentários
  const commentMilestones = [1, 5, 10, 25];
  const totalComments = comments.length;
  
  commentMilestones.forEach(milestone => {
    achievementsList.push({
      id: `comments-${milestone}`,
      name: `Colaborador Nível ${milestone}`,
      description: `Fez ${milestone} comentários em soluções`,
      category: "achievement",
      isUnlocked: totalComments >= milestone,
      earnedAt: totalComments >= milestone ? 
        comments[0]?.created_at : undefined,
      requiredCount: milestone,
      currentCount: totalComments,
    });
  });
  
  // Conquistas de likes recebidos
  const likeMilestones = [1, 10, 50, 100];
  
  likeMilestones.forEach(milestone => {
    achievementsList.push({
      id: `likes-${milestone}`,
      name: `Influenciador Nível ${milestone}`,
      description: `Recebeu ${milestone} likes em seus comentários`,
      category: "achievement",
      isUnlocked: likes >= milestone,
      earnedAt: likes >= milestone ? new Date().toISOString() : undefined,
      requiredCount: milestone,
      currentCount: likes,
    });
  });

  return achievementsList;
};

export const calculateStreak = (progress: ProgressData[]): number => {
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
