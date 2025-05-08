
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { VideoFormValues } from "../types/VideoTypes";
import { AulaFormValues } from "../../AulaStepWizard";

export function useVideoManager(form: UseFormReturn<AulaFormValues>) {
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
    const newVideos = [...form.getValues().videos];
    newVideos[index] = {
      ...newVideos[index],
      url: url,
      type: "panda",
      video_id: videoId,
      filePath: videoId,
      thumbnail_url: thumbnailUrl,
      embedCode: embedCode
    } as VideoFormValues;
    
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
      title: "", 
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
