
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export const useSolutionInteractions = (solutionId: string | undefined, progress: any) => {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  
  const [initializing, setInitializing] = useState(false);
  
  const startImplementation = async () => {
    if (!user || !solutionId) {
      toast.error("Você precisa estar logado para implementar esta solução");
      return false;
    }
    
    try {
      setInitializing(true);
      console.log("Iniciando implementação da solução:", solutionId);
      
      // If there's no progress record yet, create one
      if (!progress) {
        console.log("Criando novo registro de progresso");
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
          console.error("Erro ao criar progresso:", error);
          throw error;
        }
        
        console.log("Progresso criado com sucesso:", data);
      }
      
      // Navigate directly to the implementation page
      toast.success("Redirecionando para a implementação...");
      console.log("Redirecionando para /implement/" + solutionId + "/0");
      navigate(`/implement/${solutionId}/0`);
      return true;
    } catch (error) {
      console.error("Erro ao iniciar implementação:", error);
      uiToast({
        title: "Erro ao iniciar implementação",
        description: "Ocorreu um erro ao tentar iniciar a implementação da solução.",
        variant: "destructive",
      });
      return false;
    } finally {
      setInitializing(false);
    }
  };
  
  const continueImplementation = async () => {
    if (!user || !solutionId) {
      toast.error("Você precisa estar logado para continuar a implementação");
      return;
    }
    
    try {
      setInitializing(true);
      
      // If no progress exists, treat as start implementation
      if (!progress) {
        await startImplementation();
        return;
      }
      
      // Navigate to current module or start from beginning
      const currentModule = progress.current_module || 0;
      console.log("Continuando implementação no módulo:", currentModule);
      toast.success("Redirecionando para onde você parou...");
      navigate(`/implement/${solutionId}/${currentModule}`);
      
    } catch (error) {
      console.error("Erro ao continuar implementação:", error);
      uiToast({
        title: "Erro ao continuar implementação",
        description: "Ocorreu um erro ao tentar continuar a implementação.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };
  
  const toggleFavorite = () => {
    toast.success("Solução adicionada aos favoritos!");
    return true;
  };
  
  const downloadMaterials = () => {
    toast.success("Baixando materiais de apoio...");
    return true;
  };
  
  return {
    initializing,
    startImplementation,
    continueImplementation,
    toggleFavorite,
    downloadMaterials
  };
};
