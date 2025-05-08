
import React from "react";
import { Button } from "@/components/ui/button";
import { FormLabel, FormDescription } from "@/components/ui/form";
import { Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VideosHeaderProps {
  maxVideos: number;
  validationError: string | null;
  onAddVideo: () => void;
  videosCount: number;
}

export const VideosHeader: React.FC<VideosHeaderProps> = ({
  maxVideos,
  validationError,
  onAddVideo,
  videosCount
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <FormLabel className="text-base">Vídeos da Aula (máx. {maxVideos})</FormLabel>
        <Button
          type="button"
          size="sm"
          onClick={onAddVideo}
          disabled={videosCount >= maxVideos}
        >
          <Plus className="w-4 h-4 mr-1" /> Adicionar Vídeo
        </Button>
      </div>
      
      <FormDescription>
        Adicione até {maxVideos} vídeos para esta aula. Cole o código de incorporação (iframe) do Panda Video para cada vídeo.
      </FormDescription>
      
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
    </>
  );
};
