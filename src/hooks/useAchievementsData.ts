
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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*, solutions!inner(id, category)")
          .eq("user_id", user.id);

        if (progressError) {
          console.error("Error fetching progress:", progressError);
          toast({
            title: "Erro ao carregar progresso",
            description: "Não foi possível carregar seu progresso. Tente novamente mais tarde.",
            variant: "destructive",
          });
          setUserProgress([]);
        } else {
          setUserProgress(progressData || []);
        }

        // Fetch solutions to get categories
        const { data: solutionsData, error: solutionsError } = await supabase
          .from("solutions")
          .select("*")
          .eq("published", true);

        if (solutionsError) {
          console.error("Error fetching solutions:", solutionsError);
          setSolutions([]);
        } else {
          // Ensure we're setting type-safe Solution objects
          const typedSolutions = solutionsData?.map(solution => ({
            ...solution,
            difficulty: solution.difficulty as "easy" | "medium" | "advanced",
            category: toSolutionCategory(solution.category)
          })) || [];
          
          setSolutions(typedSolutions);
        }

        // Try to fetch badges (if the table exists)
        const { data: badgesData, error: badgesError } = await supabase
          .from("user_badges")
          .select("*, badges(*)")
          .eq("user_id", user.id);

        if (badgesError && !badgesError.message.includes("relation") && !badgesError.message.includes("does not exist")) {
          console.error("Error fetching badges:", badgesError);
        }

        // Generate achievements based on progress
        const processedSolutions = solutionsData?.map(solution => ({
          ...solution,
          difficulty: solution.difficulty as "easy" | "medium" | "advanced",
          category: toSolutionCategory(solution.category)
        })) || [];
        
        if (progressData) {
          const generatedAchievements = generateAchievements(progressData, processedSolutions, badgesData || []);
          setAchievements(generatedAchievements);
        } else {
          setAchievements([]);
        }
      } catch (error) {
        console.error("Error in fetching achievements data:", error);
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
    achievements,
    userProgress,
    solutions
  };
};

// Generate achievements based on progress and solutions data
const generateAchievements = (progress: any[], solutions: Solution[], badges: any[]): Achievement[] => {
  const achievementsList: Achievement[] = [];

  // Map to store solution categories by id
  const solutionCategories = solutions.reduce<Record<string, SolutionCategory>>((acc, solution) => {
    acc[solution.id] = solution.category;
    return acc;
  }, {});

  // Add achievements for each completed solution category
  const categoryNames: Record<SolutionCategory, string> = {
    revenue: "Receita",
    operational: "Operacional",
    strategy: "Estratégia",
  };

  // Achievement for first solution completed
  if (progress.some(p => p.is_completed)) {
    achievementsList.push({
      id: "first-solution",
      name: "Primeira Implementação",
      description: "Parabéns por implementar sua primeira solução de IA!",
      category: "achievement",
      isUnlocked: true,
      earnedAt: progress.find(p => p.is_completed)?.completion_date,
    });
  } else {
    achievementsList.push({
      id: "first-solution",
      name: "Primeira Implementação",
      description: "Implemente sua primeira solução de IA",
      category: "achievement",
      isUnlocked: false,
      requiredCount: 1,
      currentCount: 0,
    });
  }

  // Category-specific achievements
  const categories: SolutionCategory[] = ['revenue', 'operational', 'strategy'];
  
  categories.forEach(category => {
    // Find completed solutions in this category
    const completedInCategory = progress.filter(p => {
      const solutionCategory = solutionCategories[p.solution_id];
      return p.is_completed && solutionCategory === category;
    });
    
    // Achievement for completing solutions in each category
    const achievementCounts = [1, 3, 5];
    achievementCounts.forEach(count => {
      const nameMap: Record<number, string> = {
        1: "Iniciante",
        3: "Intermediário",
        5: "Especialista",
      };
      
      achievementsList.push({
        id: `${category}-${count}`,
        name: `${nameMap[count]} em ${categoryNames[category]}`,
        description: `Complete ${count} soluções na categoria ${categoryNames[category]}`,
        category: category,
        isUnlocked: completedInCategory.length >= count,
        earnedAt: completedInCategory.length >= count ? 
          completedInCategory[Math.min(count - 1, completedInCategory.length - 1)]?.completion_date : undefined,
        requiredCount: count,
        currentCount: completedInCategory.length,
      });
    });
  });

  // Add dummy achievement placeholders if few achievements
  if (achievementsList.length < 8) {
    const placeholdersNeeded = 8 - achievementsList.length;
    for (let i = 0; i < placeholdersNeeded; i++) {
      achievementsList.push({
        id: `placeholder-${i}`,
        name: "Conquista Secreta",
        description: "Continue implementando soluções para desbloquear esta conquista",
        category: "achievement",
        isUnlocked: false,
      });
    }
  }

  return achievementsList;
};
