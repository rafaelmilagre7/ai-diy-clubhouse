
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

interface UseVideoUploadProps {
  solutionId: string | undefined;
}

interface YouTubeData {
  name: string;
  url: string;
  description: string;
}

export const useVideoUpload = ({ solutionId }: UseVideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Função para extrair ID do YouTube de uma URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Função para validar URL do YouTube
  const isValidYouTubeUrl = (url: string) => {
    return !!getYouTubeId(url);
  };

  // Função para adicionar vídeo do YouTube
  const handleYoutubeUpload = async (youtubeData: YouTubeData): Promise<void> => {
    if (!solutionId) {
      toast({
        title: "Erro",
        description: "É necessário salvar as informações básicas antes de adicionar vídeos.",
        variant: "destructive"
      });
      return;
    }

    if (!youtubeData.name || !youtubeData.url) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e URL são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidYouTubeUrl(youtubeData.url)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do YouTube.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      const youtubeId = getYouTubeId(youtubeData.url);
      const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      
      const newVideo = {
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
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo do YouTube foi adicionado com sucesso."
      });

      return;
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

  // Função para fazer upload de vídeo
  const handleFileUpload = async (file: File): Promise<void> => {
    if (!solutionId) {
      toast({
        title: "Erro",
        description: "É necessário salvar as informações básicas antes de adicionar vídeos.",
        variant: "destructive"
      });
      return;
    }

    // Verificar tipos de arquivos (apenas vídeos)
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de vídeo.",
        variant: "destructive"
      });
      return;
    }

    // Verificar tamanho do arquivo (100MB máximo)
    const maxSize = 100 * 1024 * 1024; // 100MB em bytes
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
      
      // Upload para o storage
      const { error: uploadError, data } = await supabase.storage
        .from("materials")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // Simulação de progresso já que a API atual não suporta
      // onUploadProgress nativamente
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        if (progress >= 100) {
          clearInterval(interval);
          progress = 100;
        }
        setUploadProgress(progress);
      }, 100);
      
      // Obter a URL do arquivo
      const { data: urlData } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);
        
      if (!urlData) throw new Error("Não foi possível obter a URL do vídeo");
      
      // Registrar no banco de dados
      const newVideo = {
        solution_id: solutionId,
        name: file.name,
        type: "video",
        url: urlData.publicUrl,
        format: fileExt,
        size: file.size,
        metadata: {
          title: file.name,
          description: `Vídeo para a solução`,
          url: urlData.publicUrl,
          type: "video",
          source: "upload",
          format: fileExt,
          size: file.size
        }
      };
      
      const { data: videoData, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Upload concluído",
        description: "O vídeo foi adicionado com sucesso."
      });
      
      clearInterval(interval);
      setUploadProgress(100);
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

  return {
    handleFileUpload,
    handleYoutubeUpload,
    uploading,
    uploadProgress
  };
};
