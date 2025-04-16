
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingScreen from "@/components/common/LoadingScreen";
import { AchievementGrid, Achievement } from "@/components/achievements/AchievementGrid";

const Achievements = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
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
          .select("id, category")
          .eq("published", true);

        if (solutionsError) {
          console.error("Error fetching solutions:", solutionsError);
          setSolutions([]);
        } else {
          setSolutions(solutionsData || []);
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
        generateAchievements(progressData || [], solutionsData || [], badgesData || []);
      } catch (error) {
        console.error("Error in fetching achievements data:", error);
        toast({
          title: "Erro ao carregar conquistas",
          description: "Ocorreu um erro ao carregar suas conquistas. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, toast]);

  const generateAchievements = (progress: any[], solutions: Solution[], badges: any[]) => {
    const achievementsList: Achievement[] = [];

    // Map to store solution categories by id
    const solutionCategories = solutions.reduce((acc, solution) => {
      acc[solution.id] = solution.category;
      return acc;
    }, {} as Record<string, string>);

    // Add achievements for each completed solution category
    const categoryNames = {
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
    const categories: ('revenue' | 'operational' | 'strategy')[] = ['revenue', 'operational', 'strategy'];
    
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
          name: `${nameMap[count]} em ${categoryNames[category as keyof typeof categoryNames]}`,
          description: `Complete ${count} soluções na categoria ${categoryNames[category as keyof typeof categoryNames]}`,
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

    setAchievements(achievementsList);
  };

  const filterAchievements = (tab: string) => {
    if (tab === "all") return achievements;
    return achievements.filter(a => a.category === tab);
  };

  if (loading) {
    return <LoadingScreen message="Carregando suas conquistas..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suas Conquistas</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe seu progresso e conquistas na plataforma
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="achievement" className="text-viverblue">Conquistas</TabsTrigger>
          <TabsTrigger value="revenue" className="text-revenue">Receita</TabsTrigger>
          <TabsTrigger value="operational" className="text-operational">Operacional</TabsTrigger>
          <TabsTrigger value="strategy" className="text-strategy">Estratégia</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-4">
          <AchievementGrid achievements={filterAchievements(activeTab)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Achievements;
