
import { useState } from "react";
import { supabase, Module } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { moduleTypes } from "@/components/admin/solution/moduleTypes";

/**
 * Hook for creating modules
 */
export const useModuleCreation = (
  solutionId: string | null, 
  modules: Module[], 
  setModules: React.Dispatch<React.SetStateAction<Module[]>>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToastModern();

  // Create default modules structure or specific types
  const handleCreateDefaultModules = async (specificTypes?: string[]) => {
    if (!solutionId) return;
    
    try {
      setIsLoading(true);
      
      // Se tivermos tipos específicos, filtramos os tipos de módulo
      const typesToCreate = specificTypes 
        ? moduleTypes.filter(m => specificTypes.includes(m.type))
        : moduleTypes;
      
      // Calcular o próximo order disponível
      let nextOrder = 0;
      if (modules.length > 0) {
        // Encontrar o maior order atual e adicionar 1
        nextOrder = Math.max(...modules.map(m => m.module_order)) + 1;
      }
      
      // Criar os novos módulos com os orders corretos
      const newModules = typesToCreate.map((moduleType, idx) => ({
        solution_id: solutionId,
        title: moduleType.title,
        type: moduleType.type,
        module_order: nextOrder + idx,
        content: {
          blocks: []
        }
      }));
      
      const { data, error } = await supabase
        .from("modules")
        .insert(newModules)
        .select();
      
      if (error) {
        throw error;
      }
      
      // Atualizar a lista de módulos local
      if (data) {
        setModules(prev => [...prev, ...(data as Module[])].sort((a, b) => a.module_order - b.module_order));
      }
      
      showSuccess(
        specificTypes && specificTypes.length === 1 ? "Módulo criado" : "Módulos criados",
        specificTypes && specificTypes.length === 1 
          ? "O novo módulo foi criado com sucesso." 
          : "A estrutura de módulos foi criada com sucesso."
      );
    } catch (error) {
      console.error("Error creating modules:", error);
      showError("Erro ao criar módulos", "Não foi possível criar os módulos para esta solução.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleCreateDefaultModules
  };
};
