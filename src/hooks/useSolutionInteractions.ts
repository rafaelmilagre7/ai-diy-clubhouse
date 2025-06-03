
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
      return false; // Retorna false em caso de erro
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
            completed_modules: [], // Initialize as empty array
            last_activity: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          console.error("Erro ao criar progresso:", error);
          throw error;
        }
        
        console.log("Progresso criado com sucesso:", data);
      } else {
        console.log("Usando progresso existente:", progress);
      }
      
      // Navigate directly to the implementation page
      toast.success("Redirecionando para a implementação...");
      console.log("Redirecionando para /implement/" + solutionId + "/0");
      navigate(`/implement/${solutionId}/0`);
      return true; // Retorna true quando a implementação é iniciada com sucesso
    } catch (error) {
      console.error("Erro ao iniciar implementação:", error);
      uiToast({
        title: "Erro ao iniciar implementação",
        description: "Ocorreu um erro ao tentar iniciar a implementação da solução.",
        variant: "destructive",
      });
      return false; // Retorna false em caso de erro
    } finally {
      setInitializing(false);
    }
  };
  
  const continueImplementation = () => {
    if (!solutionId || !progress) {
      toast.error("Não foi possível continuar a implementação");
      return false; // Retorna false em caso de erro
    }
    
    // Navigate directly to the implementation page
    console.log("Continuando implementação no módulo:", progress.current_module);
    toast.success("Redirecionando para onde você parou...");
    console.log("Redirecionando para /implement/" + solutionId + "/" + (progress.current_module || 0));
    navigate(`/implement/${solutionId}/${progress.current_module || 0}`);
    return true; // Retorna true quando a continuação é bem-sucedida
  };
  
  const toggleFavorite = () => {
    toast.success("Solução adicionada aos favoritos!");
    // Implementação futura para favoritar soluções
    return true;
  };
  
  const downloadMaterials = () => {
    toast.success("Baixando materiais de apoio...");
    // Implementação futura para download de materiais
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
