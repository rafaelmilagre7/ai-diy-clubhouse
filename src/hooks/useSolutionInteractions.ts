
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { toast } from "sonner";

export const useSolutionInteractions = (solutionId: string | undefined, progress: any) => {
  const { user } = useAuth();
  const { showError, showLoading, showSuccess, dismissToast } = useToastModern();
  const navigate = useNavigate();
  
  const [initializing, setInitializing] = useState(false);
  
  const startImplementation = async () => {
    if (!user || !solutionId) {
      toast.error("Você precisa estar logado para implementar esta solução");
      return false;
    }
    
    // Toast de loading (adicional, não substitui lógica existente)
    const loadingToastId = showLoading('Iniciando implementação', 'Preparando sua jornada...');
    
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
            completed_modules: [],
            last_activity: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          console.error("❌ Erro ao criar progresso:", error);
          throw error;
        }
      }
      
      // Navigate to the implementation page starting at module 0
      const implementationUrl = `/implement/${solutionId}/0`;
      
      // Dismiss loading toast e mostrar sucesso
      dismissToast(loadingToastId);
      showSuccess('Implementação iniciada!', 'Vamos começar sua jornada');
      
      // Mantém toast legado para compatibilidade
      toast.success("Redirecionando para a implementação...");
      navigate(implementationUrl);
      return true;
    } catch (error) {
      console.error("❌ Erro ao iniciar implementação:", error);
      
      // Dismiss loading toast em caso de erro
      dismissToast(loadingToastId);
      
      showError("Erro ao iniciar implementação", "Ocorreu um erro ao tentar iniciar a implementação da solução.");
      return false;
    } finally {
      setInitializing(false);
    }
  };
  
  const continueImplementation = async () => {
    if (!solutionId || !progress) {
      toast.error("Não foi possível continuar a implementação");
      return false;
    }
    
    // Toast de loading (adicional, não substitui lógica existente)
    const loadingToastId = showLoading('Continuando implementação', 'Redirecionando para onde você parou...');
    
    try {
      setInitializing(true);
      
      // Navigate to the correct module where user left off
      const currentModule = progress.current_module || 0;
      const implementationUrl = `/implement/${solutionId}/${currentModule}`;
      
      // Dismiss loading toast
      dismissToast(loadingToastId);
      showSuccess('Continuando jornada', 'Voltando ao seu progresso');
      
      // Mantém toast legado para compatibilidade
      toast.success("Redirecionando para onde você parou...");
      navigate(implementationUrl);
      return true;
    } catch (error) {
      console.error("❌ Erro ao continuar implementação:", error);
      
      // Dismiss loading toast em caso de erro
      dismissToast(loadingToastId);
      
      toast.error("Erro ao continuar implementação");
      return false;
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
