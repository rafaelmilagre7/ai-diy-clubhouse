
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Module } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { moduleTypes } from "./moduleTypes";

export const useModulesForm = (solutionId: string | null) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch modules when solutionId changes
  useEffect(() => {
    if (solutionId) {
      fetchModules();
    }
  }, [solutionId]);

  // Function to fetch modules from Supabase
  const fetchModules = async () => {
    if (!solutionId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("solution_id", solutionId)
        .order("module_order", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setModules(data as Module[]);
      } else {
        // If no modules exist, we'll create the default structure
        await createDefaultModules();
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Erro ao carregar módulos",
        description: "Não foi possível carregar os módulos desta solução.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create default modules structure
  const createDefaultModules = async () => {
    if (!solutionId) return;
    
    try {
      const defaultModules = moduleTypes.map(moduleType => ({
        solution_id: solutionId,
        title: moduleType.title,
        type: moduleType.type,
        module_order: moduleType.order,
        content: {
          blocks: []
        }
      }));
      
      const { data, error } = await supabase
        .from("modules")
        .insert(defaultModules)
        .select();
      
      if (error) {
        throw error;
      }
      
      setModules(data as Module[]);
      toast({
        title: "Módulos criados",
        description: "A estrutura básica de módulos foi criada com sucesso.",
      });
    } catch (error) {
      console.error("Error creating default modules:", error);
      toast({
        title: "Erro ao criar módulos",
        description: "Não foi possível criar a estrutura básica de módulos.",
        variant: "destructive",
      });
    }
  };

  // Select a module to edit
  const handleEditModule = (index: number) => {
    setSelectedModuleIndex(index);
    setIsEditing(true);
  };

  // Preview implementation
  const handlePreviewImplementation = () => {
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
    modules,
    selectedModuleIndex,
    isEditing,
    isLoading,
    handleEditModule,
    handlePreviewImplementation,
    handleBackToList,
    handleModuleSave,
    handleNavigateModule
  };
};
