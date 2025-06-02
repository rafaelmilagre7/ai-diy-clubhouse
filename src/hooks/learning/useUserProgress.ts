
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { LearningProgress } from "@/lib/supabase/types";

export const useUserProgress = () => {
  const { user } = useAuth();

  const {
    data: userProgress = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["user-learning-progress", user?.id],
    queryFn: async (): Promise<LearningProgress[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao buscar progresso do usuário:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  return {
    userProgress,
    isLoading,
    error
  };
};
