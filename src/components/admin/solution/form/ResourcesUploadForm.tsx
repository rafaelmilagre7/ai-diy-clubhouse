
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  // Função para extrair ID do vídeo do YouTube
  const getYouTubeVideoId = (url: string) => {
    let videoId = "";
    
    if (url.includes("youtube.com/watch")) {
      videoId = new URL(url).searchParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
    }
    
    return videoId;
  };

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Desconhecido";
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Gerenciar submissão de URL do YouTube
  const handleYoutubeUrlSubmit = async (url: string) => {
    if (!solutionId) return;
    
    try {
      const videoId = getYouTubeVideoId(url);
      
      if (!videoId) {
        toast({
          title: "URL inválido",
          description: "Por favor, insira um URL válido do YouTube.",
          variant: "destructive",
        });
        return;
      }
      
      // Criar URL de embed
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      // Criar entrada de recurso
      await handleUploadComplete(embedUrl, `Vídeo do YouTube (${videoId})`, 0);
    } catch (error: any) {
      console.error("Erro ao adicionar vídeo do YouTube:", error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: error.message || "Ocorreu um erro ao tentar adicionar o vídeo do YouTube.",
        variant: "destructive",
      });
    }
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
        handleYoutubeUrlSubmit={handleYoutubeUrlSubmit}
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
