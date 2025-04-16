
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
    if (!user || !solutionId) return;
    
    try {
      setInitializing(true);
      
      // If there's no progress record yet, create one
      if (!progress) {
        const { data, error } = await supabase
          .from("progress")
          .insert({
            user_id: user.id,
            solution_id: solutionId,
            current_module: 0,
            is_completed: false,
            last_activity: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
      }
      
      // Navigate to the implementation page, starting with module 0 (landing)
      navigate(`/implement/${solutionId}/0`);
    } catch (error) {
      console.error("Error starting implementation:", error);
      uiToast({
        title: "Erro ao iniciar implementação",
        description: "Ocorreu um erro ao tentar iniciar a implementação da solução.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };
  
  const continueImplementation = () => {
    if (!solutionId || !progress) return;
    navigate(`/implement/${solutionId}/${progress.current_module}`);
  };
  
  const toggleFavorite = () => {
    toast.success("Solução adicionada aos favoritos!");
    // Implementação futura para favoritar soluções
  };
  
  const downloadMaterials = () => {
    toast.success("Baixando materiais de apoio...");
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
