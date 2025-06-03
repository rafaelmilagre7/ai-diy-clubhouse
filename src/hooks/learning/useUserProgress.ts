
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

export function useUserProgress() {
  const { user } = useAuth();
  
  const { data: userProgress = [], isLoading } = useQuery({
    queryKey: ["learning-user-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", user?.id || "");
        
      if (error) {
        console.error("Erro ao carregar progresso:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  return {
    userProgress,
    isLoading
  };
}
