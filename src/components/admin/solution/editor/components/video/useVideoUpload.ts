
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface UseVideoUploadProps {
  solutionId: string | undefined;
}

interface YoutubeData {
  name: string;
  url: string;
  description?: string;
}

export const useVideoUpload = ({ solutionId }: UseVideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleYoutubeUpload = async (youtubeData: YoutubeData) => {
    if (!solutionId) {
      toast.error("Salve as informações básicas antes de adicionar vídeos.");
      return;
    }

    try {
      setUploading(true);
      
      const youtubeId = getYouTubeId(youtubeData.url);
      if (!youtubeId) {
        throw new Error("URL do YouTube inválida");
      }

      const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      
      const { error } = await supabase
        .from("solution_resources")
        .insert({
          solution_id: solutionId,
          name: youtubeData.name,
          type: "video",
          url: embedUrl,
          metadata: {
            title: youtubeData.name,
            description: youtubeData.description,
            url: embedUrl,
            type: "video",
            source: "youtube",
            youtube_id: youtubeId,
            thumbnail_url: thumbnailUrl
          }
        });
        
      if (error) throw error;
      
      toast.success("Vídeo do YouTube adicionado com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao adicionar vídeo:", error);
      toast.error("Ocorreu um erro ao tentar adicionar o vídeo.");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!solutionId) {
      toast.error("Salve as informações básicas antes de adicionar vídeos.");
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Por favor, selecione apenas arquivos de vídeo.");
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `solution_videos/${solutionId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);
        
      if (!urlData) throw new Error("Não foi possível obter a URL do vídeo");
      
      const { error } = await supabase
        .from("solution_resources")
        .insert({
          solution_id: solutionId,
          name: file.name,
          type: "video",
          url: urlData.publicUrl,
          metadata: {
            title: file.name,
            description: `Vídeo para a solução`,
            url: urlData.publicUrl,
            type: "video",
            source: "upload",
            format: fileExt,
            size: file.size
          }
        });
        
      if (error) throw error;
      
      toast.success("Vídeo carregado com sucesso");
      return true;
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Ocorreu um erro ao tentar fazer o upload do vídeo.");
      return false;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    handleFileUpload,
    handleYoutubeUpload,
    uploading,
    uploadProgress
  };
};
