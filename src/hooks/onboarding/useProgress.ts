
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { toast } from "sonner";

export const useProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  const progressId = useRef<string | null>(null);
  const isMounted = useRef(true);

  // Efeito para gerenciar o estado montado/desmontado
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!user) return null;
    
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

      if (!isMounted.current) return null;

      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrou registro, vamos criar um novo
          console.log("Criando novo registro de progresso para o usuário");
          return await createInitialProgress();
        } else {
          console.error("Erro ao carregar progresso:", error);
          toast.error("Erro ao carregar seu progresso. Algumas funcionalidades podem estar limitadas.");
          return null;
        }
      } else {
        console.log("Progresso carregado com sucesso:", data);
        setProgress(data);
        progressId.current = data.id;
        return data;
      }
    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
      if (isMounted.current) {
        toast.error("Erro ao carregar seu progresso. Algumas funcionalidades podem estar limitadas.");
      }
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        hasInitialized.current = true;
      }
    }
  }, [user]);

  const createInitialProgress = async () => {
    if (!user) return null;
    
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
        },
        professional_info: {},
        business_context: {},
        ai_experience: {},
        business_goals: {},
        experience_personalization: {},
        complementary_info: {}
      };

      const { data, error } = await supabase
        .from("onboarding_progress")
        .insert(initialData)
        .select()
        .single();

      if (!isMounted.current) return null;

      if (error) {
        console.error("Erro ao criar progresso inicial:", error);
        toast.error("Erro ao inicializar seu progresso. Por favor, recarregue a página.");
        throw error;
      }
      
      console.log("Progresso inicial criado:", data);
      setProgress(data);
      progressId.current = data.id;
      return data;
    } catch (error) {
      console.error("Erro ao criar progresso inicial:", error);
      if (isMounted.current) {
        toast.error("Erro ao inicializar seu progresso. Por favor, recarregue a página.");
      }
      return null;
    }
  };

  useEffect(() => {
    if (!user || hasInitialized.current) return;
    fetchProgress();
    
    // Cleanup function
    return () => {
      // Não resetamos hasInitialized aqui para evitar múltiplas inicializações
    };
  }, [user, fetchProgress]);

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!user || !progress) {
      console.error("Usuário ou progresso não disponível");
      return null;
    }

    try {
      console.log("Atualizando progresso:", updates);
      const { error, data } = await supabase
        .from("onboarding_progress")
        .update(updates)
        .eq("id", progress.id)
        .select()
        .single();

      if (!isMounted.current) return null;

      if (error) {
        console.error("Erro ao atualizar dados:", error);
        toast.error("Erro ao salvar seu progresso.");
        throw error;
      }
      
      // Atualizamos o estado local para refletir as mudanças imediatamente
      const updatedProgress = { ...progress, ...updates };
      setProgress(updatedProgress);
      console.log("Progresso atualizado com sucesso:", updatedProgress);
      return updatedProgress;
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      if (isMounted.current) {
        toast.error("Erro ao salvar seu progresso.");
      }
      throw error;
    }
  };
  
  // Função para recarregar os dados do progresso do servidor
  const refreshProgress = useCallback(async () => {
    if (!user) return null;
    
    if (!progressId.current) {
      return await fetchProgress();
    }
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("id", progressId.current)
        .single();
        
      if (!isMounted.current) return null;

      if (error) {
        console.error("Erro ao recarregar progresso:", error);
        toast.error("Erro ao atualizar dados. Tente recarregar a página.");
        throw error;
      }
      
      console.log("Progresso recarregado com sucesso:", data);
      setProgress(data);
      return data;
    } catch (error) {
      console.error("Erro ao recarregar progresso:", error);
      if (isMounted.current) {
        toast.error("Erro ao atualizar dados. Tente recarregar a página.");
      }
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, fetchProgress]);

  return {
    progress,
    isLoading,
    updateProgress,
    refreshProgress,
    fetchProgress
  };
};
