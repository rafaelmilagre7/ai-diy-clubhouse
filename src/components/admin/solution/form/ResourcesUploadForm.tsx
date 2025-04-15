
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatFileSize } from "./utils/resourceUtils";
import { useResourcesManager } from "./hooks/useResourcesManager";
import { useResourceFiltering } from "./hooks/useResourceFiltering";
import { useResourceDialog } from "./hooks/useResourceDialog";
import { getFileIcon } from "./utils/iconUtils";

// Import custom components
import ResourceFilterBar from "./components/ResourceFilterBar";
import ResourceUploadCard from "./components/ResourceUploadCard";
import ResourceList from "./components/ResourceList";
import ResourceFormDialog from "./components/ResourceFormDialog";

interface ResourcesUploadFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesUploadForm: React.FC<ResourcesUploadFormProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  const { toast } = useToast();
  
  // Use custom hooks
  const {
    resources,
    loading,
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleCreateResource,
    handleRemoveResource
  } = useResourcesManager(solutionId);
  
  const {
    searchQuery,
    setSearchQuery,
    activeFilterTab,
    setActiveFilterTab,
    filteredResources
  } = useResourceFiltering(resources);
  
  const {
    showNewResourceDialog,
    setShowNewResourceDialog,
    newResource,
    setNewResource,
    resetNewResource
  } = useResourceDialog();

  const handleCreateAndCloseDialog = async () => {
    const success = await handleCreateResource(newResource);
    if (success) {
      resetNewResource();
      setShowNewResourceDialog(false);
    }
  };

  const saveAndContinue = async () => {
    if (!solutionId) return;
    
    try {
      setSavingResources(true);
      
      onSave();
      
      toast({
        title: "Recursos salvos",
        description: "Os recursos foram salvos com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar recursos:", error);
      toast({
        title: "Erro ao salvar recursos",
        description: error.message || "Ocorreu um erro ao tentar salvar os recursos.",
        variant: "destructive",
      });
    } finally {
      setSavingResources(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Materiais de Apoio</h3>
        <p className="text-sm text-muted-foreground">
          Adicione documentos, templates e imagens que ajudarão o usuário a implementar a solução.
        </p>
      </div>
      
      <ResourceFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilterTab={activeFilterTab}
        setActiveFilterTab={setActiveFilterTab}
        openNewResourceDialog={() => setShowNewResourceDialog(true)}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResourceUploadCard handleUploadComplete={handleUploadComplete} />
      </div>
      
      <ResourceList 
        filteredResources={filteredResources} 
        searchQuery={searchQuery} 
        handleRemoveResource={handleRemoveResource}
        formatFileSize={formatFileSize}
      />
      
      <ResourceFormDialog
        showDialog={showNewResourceDialog}
        setShowDialog={setShowNewResourceDialog}
        newResource={newResource}
        setNewResource={setNewResource}
        handleCreateResource={handleCreateAndCloseDialog}
        getFileIcon={getFileIcon}
      />
      
      <Button 
        onClick={saveAndContinue}
        disabled={savingResources || saving}
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        {savingResources ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar e Continuar
          </>
        )}
      </Button>
    </div>
  );
};

export default ResourcesUploadForm;
