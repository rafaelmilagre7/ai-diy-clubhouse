
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { VideoFormValues } from "../types/VideoTypes";
import { AulaFormValues } from "../../schemas/aulaFormSchema";

export interface VideoManagerHookReturnType {
  videos: VideoFormValues[];
  maxVideos: number;
  validationError: string | null;
  handleVideoChange: (index: number, field: string, value: any) => void;
  handleEmbedChange: (index: number, embedCode: string, videoId: string, url: string, thumbnailUrl: string) => void;
  handleAddVideo: () => void;
  handleRemoveVideo: (index: number) => void;
  onDragEnd: (result: any) => void;
  setValidationError: (error: string | null) => void;
}

export function useVideoManager(form: UseFormReturn<AulaFormValues>): VideoManagerHookReturnType {
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const videos = form.watch('videos') || [];
  const maxVideos = 5;

  const handleVideoChange = (index: number, field: string, value: any) => {
    const newVideos = [...form.getValues().videos];
    // Garantir conversão para number no caso do fileSize
    if (field === 'fileSize' && value !== undefined && value !== null) {
      newVideos[index] = { 
        ...newVideos[index], 
        [field]: typeof value === 'string' ? Number(value) : value
      };
    } else {
      newVideos[index] = { ...newVideos[index], [field]: value };
    }
    
    // Garantir que o vídeo tenha um ID único
    if (field === 'title' && !newVideos[index].id) {
      newVideos[index].id = `temp-video-${index}-${Date.now()}`;
    }
    
    form.setValue("videos", newVideos, { shouldValidate: true });
    setValidationError(null);
  };

  const handleEmbedChange = (index: number, embedCode: string, videoId: string, url: string, thumbnailUrl: string) => {
    console.log("🎬 useVideoManager - handleEmbedChange chamado:", {
      index,
      embedCode: embedCode.substring(0, 100) + "...",
      videoId,
      url,
      thumbnailUrl
    });
    
    const newVideos = [...form.getValues().videos];
    newVideos[index] = {
      ...newVideos[index],
      url: url,
      type: "panda",
      video_id: videoId,
      filePath: videoId,
      thumbnail_url: thumbnailUrl,
      embedCode: embedCode,
      // CORREÇÃO: Garantir que há um título por padrão
      title: newVideos[index].title || "Vídeo Panda Video"
    } as VideoFormValues;
    
    console.log("🎬 useVideoManager - Vídeo atualizado:", newVideos[index]);
    form.setValue("videos", newVideos, { shouldValidate: true });
    setValidationError(null);
  };

  const handleAddVideo = () => {
    if (videos.length >= maxVideos) {
      setValidationError(`Você pode adicionar no máximo ${maxVideos} vídeos.`);
      return;
    }
    
    const currentVideos = form.getValues().videos || [];
    form.setValue("videos", [...currentVideos, { 
      id: `temp-video-${currentVideos.length}-${Date.now()}`,
      title: "Novo Vídeo", // CORREÇÃO: Título padrão não vazio
      description: "", 
      url: "", 
      type: "panda",
      embedCode: ""
    } as VideoFormValues], { shouldValidate: true });
  };

  const handleRemoveVideo = (index: number) => {
    const videos = form.getValues().videos || [];
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    form.setValue("videos", newVideos, { shouldValidate: true });
    setValidationError(null);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(form.getValues().videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setValue("videos", items, { shouldValidate: true });
  };

  return {
    videos,
    maxVideos,
    validationError,
    handleVideoChange,
    handleEmbedChange,
    handleAddVideo,
    handleRemoveVideo,
    onDragEnd,
    setValidationError
  };
}
