
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

export const useSolutionInteractions = (solutionId: string | undefined, progress: any) => {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const { log, logError } = useLogging("useSolutionInteractions");
  
  const [initializing, setInitializing] = useState(false);
  
  const startImplementation = async (): Promise<void> => {
    if (!user) {
      uiToast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para implementar esta solução",
        variant: "destructive"
      });
      return;
    }
    
    if (!solutionId) {
      uiToast({
        title: "Erro",
        description: "ID da solução não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setInitializing(true);
      log("Iniciando implementação da solução", { solutionId });
      
      // Verificar se a solução existe antes de prosseguir
      const { data: solutionData, error: solutionError } = await supabase
        .from("solutions")
        .select("id, title")
        .eq("id", solutionId)
        .maybeSingle();
        
      if (solutionError || !solutionData) {
        logError("Erro ao verificar solução", { error: solutionError });
        uiToast({
          title: "Solução não encontrada",
          description: "Não foi possível encontrar a solução solicitada.",
          variant: "destructive"
        });
        return;
      }
      
      // If there's no progress record yet, create one
      if (!progress) {
        log("Criando novo registro de progresso", { userId: user.id, solutionId });
        const { data, error } = await supabase
          .from("progress")
          .insert({
            user_id: user.id,
            solution_id: solutionId,
            current_module: 0,
            is_completed: false,
            completed_modules: [], 
            last_activity: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          logError("Erro ao criar progresso", { error });
          uiToast({
            title: "Erro ao criar progresso",
            description: "Ocorreu um erro ao tentar iniciar a implementação.",
            variant: "destructive"
          });
          return;
        }
        
        log("Progresso criado com sucesso", { data });
      } else {
        log("Usando progresso existente", { progress });
      }
      
      // Navegar para implementação
      log("Redirecionando para", { path: `/implement/${solutionId}/0` });
      navigate(`/implement/${solutionId}/0`);
    } catch (error) {
      logError("Erro ao iniciar implementação", { error });
      uiToast({
        title: "Erro ao iniciar implementação",
        description: "Ocorreu um erro ao tentar iniciar a implementação da solução.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };
  
  const continueImplementation = async (): Promise<void> => {
    if (!solutionId) {
      uiToast({
        title: "Erro",
        description: "ID da solução não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    if (!progress) {
      // Se não há progresso, iniciar como novo
      await startImplementation();
      return;
    }
    
    try {
      // Navigate directly to the implementation page
      const moduleIdx = progress.current_module || 0;
      log("Continuando implementação no módulo", { moduleIdx });
      navigate(`/implement/${solutionId}/${moduleIdx}`);
    } catch (error) {
      logError("Erro ao continuar implementação", { error });
      uiToast({
        title: "Erro ao continuar implementação",
        description: "Ocorreu um erro ao continuar a implementação da solução.",
        variant: "destructive"
      });
    }
  };
  
  const toggleFavorite = async (): Promise<void> => {
    // Implementação futura
  };
  
  const downloadMaterials = async (): Promise<void> => {
    // Implementação futura
  };
  
  return {
    initializing,
    startImplementation,
    continueImplementation,
    toggleFavorite,
    downloadMaterials
  };
};
