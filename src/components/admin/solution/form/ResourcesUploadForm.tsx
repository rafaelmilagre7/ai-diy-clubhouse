
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

  // Function to extract YouTube video ID
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

  // Handle YouTube URL submission
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
      
      // Create embed URL
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      // Create resource entry
      const newResource = {
        solution_id: solutionId,
        name: `Vídeo do YouTube (${videoId})`,
        url: embedUrl,
        type: "video",
        format: "Vídeo do YouTube",
        metadata: JSON.stringify({
          title: `Vídeo do YouTube (${videoId})`,
          description: "Vídeo do YouTube",
          url: embedUrl,
          type: "video",
          format: "Vídeo do YouTube",
          tags: ["youtube", "video"],
          order: 0,
          downloads: 0,
          size: 0,
          version: "1.0"
        }),
        size: 0
      };
      
      // Usamos "solution_resources" como string direta, mas precisamos ter certeza de que ela está definida nas tipagens
      // @ts-ignore - A tabela solution_resources foi adicionada, mas o TypeScript pode não reconhecê-la imediatamente
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newResource)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to resources list
      if (data) {
        const resource: Resource = {
          id: data.id,
          name: data.name,
          url: data.url,
          type: "video",
          format: data.format,
          solution_id: data.solution_id,
          metadata: {
            title: `Vídeo do YouTube (${videoId})`,
            description: "Vídeo do YouTube",
            url: embedUrl,
            type: "video",
            format: "Vídeo do YouTube",
            tags: ["youtube", "video"],
            order: 0,
            downloads: 0,
            size: 0,
            version: "1.0"
          },
          created_at: data.created_at,
          updated_at: data.updated_at,
          module_id: data.module_id,
          size: data.size
        };
        
        // Update resources state
        setResources(prev => [...prev, resource]);
      }
      
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo do YouTube foi adicionado com sucesso.",
      });
      
    } catch (error: any) {
      console.error("Erro ao adicionar vídeo do YouTube:", error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: error.message || "Ocorreu um erro ao tentar adicionar o vídeo do YouTube.",
        variant: "destructive",
      });
    }
  };

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
      <Card className="border border-[#0ABAB5]/20">
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
              handleYoutubeUrlSubmit={handleYoutubeUrlSubmit}
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
            Salvar Materiais
          </>
        )}
      </Button>
    </div>
  );
};

export default ResourcesUploadForm;
