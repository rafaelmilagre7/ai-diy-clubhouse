
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

interface VideoItem {
  id: string;
  name: string;
  url: string;
  type: "youtube" | "upload";
  solution_id?: string;
  metadata?: any;
  created_at?: string;
}

interface UseVideosProps {
  solutionId: string | undefined;
}

export const useVideos = ({ solutionId }: UseVideosProps) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [addYouTubeOpen, setAddYouTubeOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
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
  
  // Carregar vídeos da solução
  useEffect(() => {
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
        
        setVideos(data?.map(video => ({
          ...video,
          type: video.metadata?.source === "youtube" ? "youtube" : "upload"
        })) || []);
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
    
    fetchVideos();
  }, [solutionId, toast]);

  // Função para adicionar vídeo do YouTube
  const handleAddYouTube = async (youtubeData: {
    name: string;
    url: string;
    description: string;
  }) => {
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
      
      setVideos(prev => [{
        ...data[0],
        type: "youtube"
      }, ...prev]);
      setAddYouTubeOpen(false);
      
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo do YouTube foi adicionado com sucesso."
      });
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
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!solutionId) {
      toast({
        title: "Erro",
        description: "É necessário salvar as informações básicas antes de adicionar vídeos.",
        variant: "destructive"
      });
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Verificar tipos de arquivos (apenas vídeos)
    const videoFile = files[0];
    if (!videoFile.type.startsWith("video/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de vídeo.",
        variant: "destructive"
      });
      return;
    }

    // Verificar tamanho do arquivo (100MB máximo)
    const maxSize = 100 * 1024 * 1024; // 100MB em bytes
    if (videoFile.size > maxSize) {
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
      
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `solution_videos/${solutionId}/${fileName}`;
      
      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, videoFile, {
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setUploadProgress(percentage);
          }
        });
        
      if (uploadError) throw uploadError;
      
      // Obter a URL do arquivo
      const { data: urlData } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);
        
      if (!urlData) throw new Error("Não foi possível obter a URL do vídeo");
      
      // Registrar no banco de dados
      const newVideo = {
        solution_id: solutionId,
        name: videoFile.name,
        type: "video",
        url: urlData.publicUrl,
        format: fileExt,
        size: videoFile.size,
        metadata: {
          title: videoFile.name,
          description: `Vídeo para a solução`,
          url: urlData.publicUrl,
          type: "video",
          source: "upload",
          format: fileExt,
          size: videoFile.size
        }
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();
        
      if (error) throw error;
      
      setVideos(prev => [{
        ...data[0],
        type: "upload"
      }, ...prev]);
      
      toast({
        title: "Upload concluído",
        description: "O vídeo foi adicionado com sucesso."
      });
      
      // Limpar input file após upload
      e.target.value = "";
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

  // Função para remover vídeo
  const handleRemove = async (id: string, url: string) => {
    try {
      // Remover do banco de dados
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Atualizar estado
      setVideos(prev => prev.filter(v => v.id !== id));
      
      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso."
      });
      
      // Tentativa de remover do storage se for um upload
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
          // Não mostrar erro ao usuário já que o registro foi removido do BD
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

  const filteredVideos = videos.filter(video => {
    if (activeFilter === "all") return true;
    return video.type === activeFilter;
  });

  return {
    videos: filteredVideos,
    loading,
    uploading,
    uploadProgress,
    addYouTubeOpen,
    setAddYouTubeOpen,
    activeFilter,
    setActiveFilter,
    handleAddYouTube,
    handleVideoFileUpload,
    handleRemove
  };
};
