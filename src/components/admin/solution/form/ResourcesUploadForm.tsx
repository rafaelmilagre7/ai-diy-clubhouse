
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResourcesManager } from "./hooks/useResourcesManager";
import ResourceUploadCard from "./components/ResourceUploadCard";
import ResourceList from "./components/ResourceList";

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
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use hook para gerenciar recursos
  const {
    resources,
    loading,
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleRemoveResource
  } = useResourcesManager(solutionId);

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Desconhecido";
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Função para salvar e continuar
  const saveAndContinue = async () => {
    if (!solutionId) return;
    
    try {
      setSavingResources(true);
      
      // Chamada da função para salvar fornecida via props
      onSave();
      
      toast({
        title: "Materiais salvos",
        description: "Os materiais foram salvos com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar materiais:", error);
      toast({
        title: "Erro ao salvar materiais",
        description: error.message || "Ocorreu um erro ao tentar salvar os materiais.",
        variant: "destructive",
      });
    } finally {
      setSavingResources(false);
    }
  };

  // Filtrar recursos com base na pesquisa
  const filteredResources = resources.filter(resource => 
    resource.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Renderizar loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResourceUploadCard 
        handleUploadComplete={handleUploadComplete} 
      />
      
      <ResourceList 
        filteredResources={filteredResources} 
        searchQuery={searchQuery} 
        handleRemoveResource={handleRemoveResource}
        formatFileSize={formatFileSize}
      />
      
      <Button 
        onClick={saveAndContinue}
        disabled={savingResources || saving}
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        {savingResources || saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar Materiais
          </>
        )}
      </Button>
    </div>
  );
};

export default ResourcesUploadForm;
