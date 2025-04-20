
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

export interface OnboardingProgress {
  id: string;
  user_id: string;
  completed_steps: string[];
  current_step: string;
  is_completed: boolean;
  company_data: Record<string, any>;
  business_data: Record<string, any>;
  ai_knowledge_level: string;
  goals: string[];
}

export const useProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("onboarding_progress")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setProgress(data);
      } catch (error) {
        console.error("Erro ao carregar progresso:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!user || !progress) return;

    try {
      const { error } = await supabase
        .from("onboarding_progress")
        .update(updates)
        .eq("id", progress.id);

      if (error) throw error;
      setProgress({ ...progress, ...updates });
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      throw error;
    }
  };

  return {
    progress,
    isLoading,
    updateProgress,
  };
};
