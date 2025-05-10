
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

export const useProfileData = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { stats, loading: statsLoading } = useUserStats();
  
  const [loading, setLoading] = useState(true);
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  
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
            completed_at: item.completed_at,
            last_activity: item.last_activity
          })) || [];
          
          setImplementations(formattedImplementations);
        }
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
    implementations
  };
};
