
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";

/**
 * Hook personalizado para gerenciar as funcionalidades da tela de publicação
 * Gerencia estado de publicação, notificações e navegação
 */
export const usePublishSolution = (
  solutionId: string | null,
  solution: Solution | null,
  onSave: (values: any) => Promise<void>,
  saving: boolean
) => {
  const [isPublished, setIsPublished] = useState(solution?.published || false);
  const { showSuccess, showError } = useToastModern();
  const navigate = useNavigate();

  /**
   * Função para alternar o estado de publicação da solução
   * Exibe feedback ao usuário sobre o sucesso ou falha da operação
   */
  const handlePublishToggle = async (checked: boolean) => {
    setIsPublished(checked);
    
    try {
      await onSave({
        ...solution,
        published: checked
      });
      
      if (checked) {
        showSuccess("Solução publicada", "A solução agora está visível para os membros.");
      } else {
        showError("Solução despublicada", "A solução agora está oculta para os membros.");
      }
    } catch (error: any) {
      console.error("Erro ao atualizar status de publicação:", error);
      
      // Reverter o estado em caso de erro
      setIsPublished(!checked);
      
      showError(
        "Erro ao atualizar publicação",
        error.message || "Ocorreu um erro ao tentar atualizar o status de publicação."
      );
    }
  };

  /**
   * Função para navegar para a visualização da solução
   * Permite previsualizar como a solução ficará para os membros
   */
  const handleViewSolution = () => {
    if (solutionId) {
      navigate(`/solution/${solutionId}`);
    }
  };

  return {
    isPublished,
    saving,
    handlePublishToggle,
    handleViewSolution
  };
};
