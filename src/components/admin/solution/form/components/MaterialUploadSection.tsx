
import React from "react";
import ResourceUploadCard from "./ResourceUploadCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName } from "../utils/resourceUtils";

interface MaterialUploadSectionProps {
  solutionId: string | null;
  onUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
  bucketReady?: boolean;
}

const MaterialUploadSection: React.FC<MaterialUploadSectionProps> = ({
  solutionId,
  onUploadComplete,
  bucketReady = true
}) => {
  const { toast } = useToast();

  // Manipulador para URL do YouTube
  const handleYoutubeUrlSubmit = async (url: string) => {
    if (!solutionId) {
      toast({
        title: "Erro",
        description: "É necessário salvar a solução antes de adicionar materiais.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extrair ID do vídeo do YouTube
      let videoId = "";
      if (url.includes("youtube.com/watch")) {
        videoId = new URL(url).searchParams.get("v") || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
      }

      if (!videoId) {
        toast({
          title: "Erro",
          description: "URL do YouTube inválida.",
          variant: "destructive",
        });
        return;
      }

      // Criar uma URL de incorporação padrão
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      const metadata: ResourceMetadata = {
        title: `Vídeo do YouTube (${videoId})`,
        description: `Vídeo incorporado do YouTube`,
        url: embedUrl,
        type: "video",
        format: "YouTube",
        tags: [],
        order: 0,
        downloads: 0,
        size: 0,
        version: "1.0"
      };

      // Criar o recurso no banco de dados
      const { data, error } = await supabase
        .from("solution_resources")
        .insert({
          solution_id: solutionId,
          name: `Vídeo do YouTube (${videoId})`,
          url: embedUrl,
          type: "video",
          format: "YouTube",
          metadata: JSON.stringify(metadata)
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Se bem-sucedido, chame onUploadComplete para atualizar a UI
        await onUploadComplete(embedUrl, `Vídeo do YouTube (${videoId})`, 0);
      }
    } catch (error: any) {
      console.error("Erro ao adicionar vídeo do YouTube:", error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: error.message || "Ocorreu um erro ao tentar adicionar o vídeo do YouTube.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="text-neutral-800 dark:text-white">
      <ResourceUploadCard 
        handleUploadComplete={onUploadComplete}
        handleYoutubeUrlSubmit={handleYoutubeUrlSubmit}
        bucketReady={bucketReady}
      />
    </div>
  );
};

export default MaterialUploadSection;
