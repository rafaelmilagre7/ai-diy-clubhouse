
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

export const useUserProgress = () => {
  const { user } = useAuth();
  
  const { data: userProgress = [], isLoading, error } = useQuery({
    queryKey: ["learning-user-progress"],
    queryFn: async () => {
      if (!user) return [];
      
      // CORRIGIDO: Usar learning_progress em vez da VIEW user_progress para melhor performance
      const { data, error } = await supabase
        .from("learning_progress")
        .select(`
          *,
          lesson:learning_lessons(
            *,
            module:learning_modules(
              *,
              course_id
            )
          )
        `)
        .eq("user_id", user.id);
        
      if (error) {
        console.error("Erro ao buscar progresso do usuário:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user
  });
  
  return {
    userProgress,
    isLoading,
    error
  };
};
