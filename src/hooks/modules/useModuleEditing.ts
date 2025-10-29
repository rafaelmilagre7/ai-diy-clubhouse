
import { useState } from "react";
import { supabase, Module } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { useNavigate } from "react-router-dom";

/**
 * Hook para gerenciar a edição de módulos
 */
export const useModuleEditing = (
  modules: Module[],
  setModules: React.Dispatch<React.SetStateAction<Module[]>>
) => {
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { showSuccess, showError } = useToastModern();
  const navigate = useNavigate();

  // Função para editar um módulo específico
  const handleEditModule = (index: number) => {
    if (index >= 0 && index < modules.length) {
      setSelectedModuleIndex(index);
      setIsEditing(true);
    }
  };

  // Função para salvar um módulo atualizado
  const handleModuleSave = async (updatedModule: Module) => {
    try {
      if (!updatedModule.id) {
        throw new Error("Module ID is required for update");
      }

      // Atualizar no banco de dados
      const { error } = await supabase
        .from("modules")
        .update({
          title: updatedModule.title,
          content: updatedModule.content,
          updated_at: new Date().toISOString()
        })
        .eq("id", updatedModule.id);

      if (error) {
        throw error;
      }

      // Atualizar o estado local
      setModules(prevModules => {
        const updatedModules = [...prevModules];
        const indexToUpdate = updatedModules.findIndex(m => m.id === updatedModule.id);
        
        if (indexToUpdate !== -1) {
          updatedModules[indexToUpdate] = updatedModule;
        }
        
        return updatedModules;
      });

      showSuccess("Módulo atualizado", "As alterações no módulo foram salvas com sucesso.");

      // Opcional: voltar para a lista de módulos após salvar
      // Comentado porque podemos querer continuar editando
      // setIsEditing(false);
      // setSelectedModuleIndex(null);
    } catch (error) {
      console.error("Error saving module:", error);
      showError("Erro ao salvar módulo", "Ocorreu um erro ao tentar salvar as alterações do módulo.");
    }
  };

  // Função para voltar para a lista de módulos
  const handleBackToList = () => {
    setIsEditing(false);
    setSelectedModuleIndex(null);
  };

  // Função para navegar entre módulos
  const handleNavigateModule = (direction: 'next' | 'prev') => {
    if (selectedModuleIndex === null) return;

    const totalModules = modules.length;
    let newIndex = selectedModuleIndex;

    if (direction === 'next' && selectedModuleIndex < totalModules - 1) {
      newIndex = selectedModuleIndex + 1;
    } else if (direction === 'prev' && selectedModuleIndex > 0) {
      newIndex = selectedModuleIndex - 1;
    }

    if (newIndex !== selectedModuleIndex) {
      setSelectedModuleIndex(newIndex);
    }
  };

  // Função para pré-visualizar a implementação
  const handlePreviewImplementation = (solutionId: string | null) => {
    if (solutionId) {
      navigate(`/implement/${solutionId}/0`);
    } else {
      showError("Impossível pré-visualizar", "Salve a solução primeiro para poder pré-visualizar a implementação.");
    }
  };

  return {
    selectedModuleIndex,
    isEditing,
    handleEditModule,
    handlePreviewImplementation,
    handleBackToList,
    handleModuleSave,
    handleNavigateModule
  };
};
