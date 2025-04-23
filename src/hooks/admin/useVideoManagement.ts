
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export interface VideoItem {
  id: string;
  name: string;
  url: string;
  type: string;
  metadata?: {
    source?: "youtube" | "upload";
    youtube_id?: string;
    thumbnail_url?: string;
    description?: string;
  };
}

export const useVideoManagement = (solutionId: string) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchVideos = async () => {
    if (!solutionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .eq("type", "video")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Erro ao carregar vídeos:", error);
      toast({
        title: "Erro ao carregar vídeos",
        description: "Não foi possível carregar os vídeos desta solução.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddYouTube = async (youtubeData: {
    name: string;
    url: string;
    description: string;
  }) => {
    if (!solutionId) {
      toast({
        title: "Erro",
        description: "É necessário salvar a solução antes de adicionar vídeos.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = youtubeData.url.match(regExp);
      const youtubeId = match && match[2].length === 11 ? match[2] : null;

      if (!youtubeId) {
        toast({
          title: "URL inválida",
          description: "Por favor, insira uma URL válida do YouTube.",
          variant: "destructive"
        });
        return;
      }

      const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

      const newVideo = {
        solution_id: solutionId,
        name: youtubeData.name,
        type: "video",
        url: embedUrl,
        metadata: {
          source: "youtube",
          youtube_id: youtubeId,
          thumbnail_url: thumbnailUrl,
          description: youtubeData.description
        }
      };

      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();

      if (error) throw error;

      setVideos(prev => [data[0], ...prev]);
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo do YouTube foi adicionado com sucesso."
      });
      setYoutubeDialogOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar vídeo:", error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: "Ocorreu um erro ao tentar adicionar o vídeo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!solutionId) {
      toast({
        title: "Erro",
        description: "É necessário salvar a solução antes de adicionar vídeos.",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de vídeo.",
        variant: "destructive"
      });
      return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 100MB.",
        variant: "destructive"
      });
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

      const newVideo = {
        solution_id: solutionId,
        name: file.name,
        type: "video",
        url: urlData.publicUrl,
        metadata: {
          source: "upload",
          format: fileExt,
          size: file.size,
          description: `Vídeo: ${file.name}`
        }
      };

      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();

      if (error) throw error;

      setVideos(prev => [data[0], ...prev]);
      toast({
        title: "Upload concluído",
        description: "O vídeo foi adicionado com sucesso."
      });

    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao tentar fazer o upload do vídeo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveVideo = async (id: string, url: string) => {
    try {
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setVideos(prev => prev.filter(v => v.id !== id));

      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso."
      });

      if (url.includes("materials") && !url.includes("youtube.com")) {
        try {
          const filePath = url.split("/materials/")[1];
          if (filePath) {
            await supabase.storage
              .from("materials")
              .remove([filePath]);
          }
        } catch (storageError) {
          console.error("Erro ao remover arquivo do storage:", storageError);
        }
      }
    } catch (error) {
      console.error("Erro ao remover vídeo:", error);
      toast({
        title: "Erro ao remover vídeo",
        description: "Ocorreu um erro ao tentar remover o vídeo.",
        variant: "destructive"
      });
    }
  };

  return {
    videos,
    loading,
    uploading,
    uploadProgress,
    youtubeDialogOpen,
    setYoutubeDialogOpen,
    fetchVideos,
    handleAddYouTube,
    handleFileUpload,
    handleRemoveVideo
  };
};
