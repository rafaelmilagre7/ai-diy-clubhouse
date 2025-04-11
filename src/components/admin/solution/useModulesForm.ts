
import { useModuleFetch } from "@/hooks/modules/useModuleFetch";
import { useModuleCreation } from "@/hooks/modules/useModuleCreation";
import { useModuleEditing } from "@/hooks/modules/useModuleEditing";

/**
 * Main hook for module form management
 * Composes other specialized hooks
 */
export const useModulesForm = (solutionId: string | null) => {
  // Get modules data and fetching functionality
  const { 
    modules, 
    setModules, 
    isLoading: isFetchLoading 
  } = useModuleFetch(solutionId);

  // Get module creation functionality
  const { 
    isLoading: isCreationLoading, 
    handleCreateDefaultModules 
  } = useModuleCreation(solutionId, modules, setModules);

  // Get module editing functionality
  const {
    selectedModuleIndex,
    isEditing,
    handleEditModule,
    handlePreviewImplementation: handlePreview,
    handleBackToList,
    handleModuleSave,
    handleNavigateModule
  } = useModuleEditing(modules, setModules);

  // Create a wrapper for handlePreviewImplementation that uses the current solutionId
  const handlePreviewImplementation = () => handlePreview(solutionId);

  // Combined loading state
  const isLoading = isFetchLoading || isCreationLoading;

  return {
    modules,
    selectedModuleIndex,
    isEditing,
    isLoading,
    handleEditModule,
    handlePreviewImplementation,
    handleBackToList,
    handleModuleSave,
    handleNavigateModule,
    handleCreateDefaultModules
  };
};
