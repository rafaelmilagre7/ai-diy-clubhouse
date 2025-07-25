
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
    const result = await form.trigger(['videos']);
    if (result) {
      onNext();
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
        
        <div className="flex justify-between pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
          >
            Voltar
          </Button>
          <Button 
            type="button" 
            onClick={handleContinue}
          >
            Continuar
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default EtapaVideos;
