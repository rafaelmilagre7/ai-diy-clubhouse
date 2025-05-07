
import { useState } from 'react';
import { AulaVideo } from '@/components/formacao/aulas/types';
import { toast } from 'sonner';

export const useAulaVideos = (initialVideos: AulaVideo[] = []) => {
  const [videos, setVideos] = useState<AulaVideo[]>(initialVideos);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const maxVideos = 10;
  
  const addVideo = () => {
    if (videos.length >= maxVideos) {
      setValidationError(`Você pode adicionar no máximo ${maxVideos} vídeos.`);
      toast.error(`Limite de ${maxVideos} vídeos alcançado`);
      return false;
    }
    
    const newVideo: AulaVideo = {
      id: `temp-video-${videos.length}-${Date.now()}`,
      title: "",
      description: "",
      url: "",
      type: "panda" // Padrão para Panda Video
    };
    
    setVideos([...videos, newVideo]);
    setValidationError(null);
    return true;
  };
  
  const removeVideo = (index: number) => {
    if (index < 0 || index >= videos.length) return;
    
    const videoTitle = videos[index]?.title || `Vídeo ${index + 1}`;
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    setVideos(newVideos);
    setValidationError(null);
    
    toast.info(`"${videoTitle}" foi removido`);
  };
  
  const updateVideo = (index: number, field: string, value: any) => {
    if (index < 0 || index >= videos.length) return;
    
    const newVideos = [...videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setVideos(newVideos);
    setValidationError(null);
  };
  
  const reorderVideos = (sourceIndex: number, destinationIndex: number) => {
    if (
      sourceIndex < 0 || 
      sourceIndex >= videos.length || 
      destinationIndex < 0 || 
      destinationIndex >= videos.length
    ) return;
    
    const newVideos = [...videos];
    const [movedItem] = newVideos.splice(sourceIndex, 1);
    newVideos.splice(destinationIndex, 0, movedItem);
    setVideos(newVideos);
    
    toast.info("Ordem dos vídeos atualizada");
  };
  
  const validateVideos = (): boolean => {
    setValidationError(null);
    
    // Validar se há pelo menos um vídeo
    if (videos.length === 0) {
      setValidationError("Adicione pelo menos um vídeo antes de continuar.");
      return false;
    }
    
    // Validar que todos os vídeos têm título e URL
    const incompleteVideos = videos.filter(v => !v.title || !v.url);
    if (incompleteVideos.length > 0) {
      setValidationError(`Há ${incompleteVideos.length} vídeo(s) incompleto(s). Preencha título e adicione o vídeo.`);
      return false;
    }
    
    return true;
  };
  
  // Função para manipular vídeos do Panda Video
  const handlePandaVideoChange = (index: number, videoData: any) => {
    if (!videoData) return;
    
    updateVideo(index, "url", videoData.url);
    updateVideo(index, "type", videoData.type);
    
    // Se não houver título definido pelo usuário, use o do vídeo
    if (!videos[index]?.title || videos[index]?.title === "") {
      updateVideo(index, "title", videoData.title);
    }
    
    // Campos adicionais específicos para vídeos do Panda
    updateVideo(index, "video_id", videoData.video_id);
    if (videoData.thumbnail_url) updateVideo(index, "thumbnail_url", videoData.thumbnail_url);
    if (videoData.duration_seconds) updateVideo(index, "duration_seconds", videoData.duration_seconds);
  };
  
  return {
    videos,
    setVideos,
    loading,
    setLoading,
    validationError,
    setValidationError,
    maxVideos,
    addVideo,
    removeVideo,
    updateVideo,
    reorderVideos,
    validateVideos,
    handlePandaVideoChange
  };
};
