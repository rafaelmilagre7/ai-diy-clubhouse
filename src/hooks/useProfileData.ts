
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/hooks/useUserStats";

export interface Implementation {
  id: string;
  solution: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
  };
  current_module: number;
  is_completed: boolean;
  completed_at?: string;
  last_activity?: string;
}

export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  category: string;
  isUnlocked: boolean;
  earnedAt?: string;
  requiredCount?: number;
  currentCount?: number;
}

export const useProfileData = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { stats, loading: statsLoading } = useUserStats();
  
  const [loading, setLoading] = useState(true);
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user's completed or in-progress solutions
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select(`
            *,
            solution:solution_id (
              id, title, category, difficulty
            )
          `)
          .eq("user_id", user.id);
        
        if (progressError) {
          console.error("Erro ao buscar progresso:", progressError);
          // Use mock data in case of error
          setImplementations([
            {
              id: "1",
              solution: {
                id: "s1",
                title: "Assistente de IA no WhatsApp",
                category: "operational",
                difficulty: "easy",
              },
              current_module: 2,
              is_completed: false,
            }
          ]);
        } else {
          const formattedImplementations = progressData?.map(item => ({
            id: item.id,
            solution: item.solution,
            current_module: item.current_module,
            is_completed: item.is_completed,
            completed_at: item.completion_date,
            last_activity: item.last_activity
          })) || [];
          
          setImplementations(formattedImplementations);
        }
        
        // Create user achievements (using progress data for now)
        const defaultAchievements: UserAchievement[] = [
          {
            id: "1",
            name: "Pioneiro",
            description: "Completou sua primeira implementação",
            category: "achievement",
            isUnlocked: false,
            requiredCount: 1,
            currentCount: 0
          },
          {
            id: "2",
            name: "Especialista em Vendas",
            description: "Implementou 3 soluções da trilha de Receita",
            category: "revenue",
            isUnlocked: false,
            requiredCount: 3,
            currentCount: 0
          },
          {
            id: "3",
            name: "Mestre em Automação",
            description: "Implementou 5 soluções com sucesso",
            category: "operational",
            isUnlocked: false,
            requiredCount: 5,
            currentCount: 0
          },
          {
            id: "4",
            name: "Estrategista",
            description: "Completou uma solução da trilha de Estratégia",
            category: "strategy",
            isUnlocked: false,
            requiredCount: 1,
            currentCount: 0
          }
        ];
        
        if (progressData) {
          const completedCount = progressData.filter(p => p.is_completed).length;
          const completedRevenue = progressData.filter(p => 
            p.is_completed && p.solution?.category === "revenue"
          ).length;
          const completedStrategy = progressData.filter(p => 
            p.is_completed && p.solution?.category === "strategy"
          ).length;
          
          defaultAchievements[0].currentCount = completedCount;
          defaultAchievements[0].isUnlocked = completedCount >= 1;
          if (defaultAchievements[0].isUnlocked) {
            defaultAchievements[0].earnedAt = new Date().toISOString();
          }
          
          defaultAchievements[1].currentCount = completedRevenue;
          defaultAchievements[1].isUnlocked = completedRevenue >= 3;
          if (defaultAchievements[1].isUnlocked) {
            defaultAchievements[1].earnedAt = new Date().toISOString();
          }
          
          defaultAchievements[2].currentCount = completedCount;
          defaultAchievements[2].isUnlocked = completedCount >= 5;
          if (defaultAchievements[2].isUnlocked) {
            defaultAchievements[2].earnedAt = new Date().toISOString();
          }
          
          defaultAchievements[3].currentCount = completedStrategy;
          defaultAchievements[3].isUnlocked = completedStrategy >= 1;
          if (defaultAchievements[3].isUnlocked) {
            defaultAchievements[3].earnedAt = new Date().toISOString();
          }
        }
        
        setAchievements(defaultAchievements);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus dados. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);
  
  return {
    loading: loading || statsLoading,
    profile,
    stats,
    implementations,
    achievements
  };
};
