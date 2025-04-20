
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { OnboardingData } from "@/types/onboarding";
import { toast } from "sonner";

export interface OnboardingProgress {
  id: string;
  user_id: string;
  completed_steps: string[];
  current_step: string;
  is_completed: boolean;
  personal_info?: OnboardingData['personal_info'];
  professional_info?: OnboardingData['professional_info'];
  business_goals?: OnboardingData['business_goals'];
  ai_experience?: OnboardingData['ai_experience'];
  industry_focus?: OnboardingData['industry_focus'];
  resources_needs?: OnboardingData['resources_needs'];
  team_info?: OnboardingData['team_info'];
  implementation_preferences?: OnboardingData['implementation_preferences'];
  company_data?: Record<string, any>;
  business_data?: Record<string, any>;
  ai_knowledge_level?: string;
  goals?: string[];
  training_needs?: string[];
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  current_position?: string;
  annual_revenue?: string;
}

export const useProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  const progressId = useRef<string | null>(null);

  const fetchProgress = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Buscamos primeiro por progressos já existentes para evitar duplicação
      const { data, error } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false }) // Pegar o mais recente primeiro
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrou registro, vamos criar um novo
          console.log("Criando novo registro de progresso para o usuário");
          await createInitialProgress();
        } else {
          console.error("Erro ao carregar progresso:", error);
        }
      } else {
        console.log("Progresso carregado com sucesso:", data);
        setProgress(data);
        progressId.current = data.id;
      }
    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
    } finally {
      setIsLoading(false);
      hasInitialized.current = true;
    }
  };

  const createInitialProgress = async () => {
    try {
      // Obter metadados do usuário da autenticação
      const userName = user?.user_metadata?.name || '';
      const userEmail = user?.email || '';

      const initialData = {
        user_id: user?.id,
        completed_steps: [],
        current_step: 'personal',
        is_completed: false,
        personal_info: {
          name: userName,
          email: userEmail
        }
      };

      const { data, error } = await supabase
        .from("onboarding_progress")
        .insert(initialData)
        .select()
        .single();

      if (error) throw error;
      console.log("Progresso inicial criado:", data);
      setProgress(data);
      progressId.current = data.id;
    } catch (error) {
      console.error("Erro ao criar progresso inicial:", error);
      toast.error("Não foi possível iniciar seu progresso. Tente novamente mais tarde.");
    }
  };

  useEffect(() => {
    if (!user || hasInitialized.current) return;
    fetchProgress();
    
    // Cleanup function
    return () => {
      // Não resetamos hasInitialized aqui para evitar múltiplas inicializações
    };
  }, [user]);

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!user || !progress) {
      console.error("Usuário ou progresso não disponível");
      return;
    }

    try {
      console.log("Atualizando progresso:", updates);
      const { error } = await supabase
        .from("onboarding_progress")
        .update(updates)
        .eq("id", progress.id);

      if (error) throw error;
      
      // Atualizamos o estado local para refletir as mudanças imediatamente
      setProgress(prev => prev ? { ...prev, ...updates } : null);
      console.log("Progresso atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      throw error;
    }
  };
  
  // Função para recarregar os dados do progresso do servidor
  const refreshProgress = async () => {
    if (!user || !progressId.current) return;
    
    try {
      const { data, error } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("id", progressId.current)
        .single();
        
      if (error) throw error;
      
      setProgress(data);
      console.log("Progresso recarregado com sucesso:", data);
      return data;
    } catch (error) {
      console.error("Erro ao recarregar progresso:", error);
      return null;
    }
  };

  return {
    progress,
    isLoading,
    updateProgress,
    refreshProgress,
    fetchProgress
  };
};
