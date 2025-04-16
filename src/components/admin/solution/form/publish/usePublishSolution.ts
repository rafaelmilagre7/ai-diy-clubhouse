
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SolutionFormValues } from "../solutionFormSchema";

export const usePublishSolution = (
  solutionId: string | null,
  solution: Solution | null,
  onSave: (values: any) => Promise<void>,
  saving: boolean
) => {
  const [isPublished, setIsPublished] = useState(solution?.published || false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePublishToggle = async (checked: boolean) => {
    setIsPublished(checked);
    
    try {
      await onSave({
        ...solution,
        published: checked
      });
      
      toast({
        title: checked ? "Solução publicada" : "Solução despublicada",
        description: checked 
          ? "A solução agora está visível para os membros." 
          : "A solução agora está oculta para os membros.",
        variant: checked ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar status de publicação:", error);
      
      // Reverter o estado em caso de erro
      setIsPublished(!checked);
      
      toast({
        title: "Erro ao atualizar publicação",
        description: error.message || "Ocorreu um erro ao tentar atualizar o status de publicação.",
        variant: "destructive",
      });
    }
  };

  const handleViewSolution = () => {
    if (solutionId) {
      navigate(`/solution/${solutionId}`);
    }
  };

  const handleTestImplementation = () => {
    if (solutionId) {
      navigate(`/implement/${solutionId}/0`);
    }
  };

  return {
    isPublished,
    saving,
    handlePublishToggle,
    handleViewSolution,
    handleTestImplementation
  };
};
