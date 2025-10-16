
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatFileSize } from "./utils/resourceUtils";
import { useResourcesManager } from "./hooks/useResourcesManager";
import ResourceUploadCard from "./components/ResourceUploadCard";
import ResourceList from "./components/ResourceList";
import { supabase } from "@/lib/supabase";
import { Resource } from "./types/ResourceTypes";

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
  
  // Use custom hooks
  const {
    resources,
    setResources,
    loading,
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleRemoveResource
  } = useResourcesManager(solutionId);


  const saveAndContinue = async () => {
    if (!solutionId) return;
    
    try {
      setSavingResources(true);
      
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-aurora-primary/20">
        <CardHeader>
          <CardTitle>Materiais de Apoio</CardTitle>
          <CardDescription>
            Adicione documentos, templates e imagens que ajudarão o usuário a implementar a solução.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <ResourceUploadCard 
              handleUploadComplete={handleUploadComplete} 
            />
          </div>
          
          <ResourceList 
            filteredResources={resources} 
            searchQuery={searchQuery} 
            handleRemoveResource={handleRemoveResource}
            formatFileSize={formatFileSize}
          />
        </CardContent>
      </Card>
      
      <Button 
        onClick={saveAndContinue}
        disabled={savingResources || saving}
        className="w-full"
        variant="aurora-primary"
      >
        {savingResources ? (
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
