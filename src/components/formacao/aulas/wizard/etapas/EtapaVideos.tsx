
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../schemas/aulaFormSchema";
import { VideosHeader } from "./components/VideosHeader";
import { VideosList } from "./components/VideosList";
import { useVideoManager } from "./hooks/useVideoManager";

interface EtapaVideosProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

const EtapaVideos: React.FC<EtapaVideosProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving
}) => {
  const {
    videos,
    maxVideos,
    validationError,
    handleVideoChange,
    handleEmbedChange,
    handleAddVideo,
    handleRemoveVideo,
    onDragEnd,
    setValidationError
  } = useVideoManager(form);
  
  const handleContinue = async () => {
    setValidationError(null);
    
    // Validar se há pelo menos um vídeo válido
    const currentVideos = form.getValues().videos || [];
    if (currentVideos.length === 0) {
      setValidationError("Adicione pelo menos um vídeo à aula.");
      return;
    }
    
    const result = await form.trigger(['videos']);
    if (result) {
      console.log("🎬 EtapaVideos - Validação bem-sucedida, vídeos:", currentVideos);
      onNext();
    } else {
      console.error("🎬 EtapaVideos - Falha na validação dos vídeos");
      const errors = form.formState.errors.videos;
      if (errors) {
        setValidationError("Há problemas com os vídeos. Verifique os campos obrigatórios.");
      }
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6 py-4">
        <div className="space-y-4">
          <VideosHeader
            maxVideos={maxVideos}
            validationError={validationError}
            onAddVideo={handleAddVideo}
            videosCount={videos.length}
          />
          
          <VideosList
            videos={videos}
            onDragEnd={onDragEnd}
            onVideoChange={handleVideoChange}
            onEmbedChange={handleEmbedChange}
            onRemoveVideo={handleRemoveVideo}
          />
        </div>
        
      </div>
    </Form>
  );
};

export default EtapaVideos;
