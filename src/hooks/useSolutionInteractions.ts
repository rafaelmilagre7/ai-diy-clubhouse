
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

export const useSolutionInteractions = (solutionId: string | undefined, progress: any) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  
  const [initializing, setInitializing] = useState(false);
  
  const startImplementation = async () => {
    if (!user || !solutionId) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para implementar esta solução",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setInitializing(true);
      log("Iniciando implementação da solução:", { solutionId });
      
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
            completed_modules: [], // Initialize as empty array
            last_activity: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          logError("Erro ao criar progresso:", error);
          throw error;
        }
        
        log("Progresso criado com sucesso:", { data });
      } else {
        log("Usando progresso existente:", { progress });
      }
      
      // Navigate directly to the implementation page
      log("Redirecionando para", { path: `/implement/${solutionId}/0` });
      navigate(`/implement/${solutionId}/0`);
    } catch (error) {
      logError("Erro ao iniciar implementação:", error);
      toast({
        title: "Erro ao iniciar implementação",
        description: "Ocorreu um erro ao tentar iniciar a implementação da solução.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };
  
  const continueImplementation = () => {
    if (!solutionId || !progress) {
      toast({
        title: "Erro",
        description: "Não foi possível continuar a implementação",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate directly to the implementation page
    log("Continuando implementação no módulo:", { moduleIdx: progress.current_module });
    navigate(`/implement/${solutionId}/${progress.current_module || 0}`);
  };
  
  const toggleFavorite = () => {
    toast({
      title: "Recurso em desenvolvimento",
      description: "A função de favoritos será implementada em breve."
    });
    // Implementação futura para favoritar soluções
  };
  
  const downloadMaterials = () => {
    toast({
      title: "Recurso em desenvolvimento",
      description: "O download de materiais será implementado em breve."
    });
    // Implementação futura para download de materiais
  };
  
  return {
    initializing,
    startImplementation,
    continueImplementation,
    toggleFavorite,
    downloadMaterials
  };
};
