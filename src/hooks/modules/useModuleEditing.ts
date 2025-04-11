
import { useState } from "react";
import { supabase, Module } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * Hook for editing module functionality
 */
export const useModuleEditing = (
  modules: Module[], 
  setModules: React.Dispatch<React.SetStateAction<Module[]>>
) => {
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Select a module to edit
  const handleEditModule = (index: number) => {
    setSelectedModuleIndex(index);
    setIsEditing(true);
  };

  // Preview implementation
  const handlePreviewImplementation = (solutionId: string | null) => {
    if (solutionId) {
      navigate(`/implement/${solutionId}/0`);
    }
  };

  // Go back to module list
  const handleBackToList = () => {
    setSelectedModuleIndex(null);
    setIsEditing(false);
  };

  // Handle module save
  const handleModuleSave = async (updatedModule: Module) => {
    try {
      const { error } = await supabase
        .from("modules")
        .update({
          title: updatedModule.title,
          content: updatedModule.content
        })
        .eq("id", updatedModule.id);
      
      if (error) {
        throw error;
      }
      
      // Update the local modules list
      setModules(prevModules => 
        prevModules.map(module => 
          module.id === updatedModule.id ? updatedModule : module
        )
      );
      
      toast({
        title: "Módulo atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      
      setIsEditing(false);
      setSelectedModuleIndex(null);
    } catch (error) {
      console.error("Error saving module:", error);
      toast({
        title: "Erro ao salvar módulo",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  // Navigate to next or previous module
  const handleNavigateModule = (direction: 'next' | 'prev') => {
    if (selectedModuleIndex === null) return;
    
    const newIndex = direction === 'next' 
      ? Math.min(selectedModuleIndex + 1, modules.length - 1)
      : Math.max(selectedModuleIndex - 1, 0);
    
    setSelectedModuleIndex(newIndex);
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
