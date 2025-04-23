
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Video, Youtube } from "lucide-react";

interface EmptyVideoStateProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYouTubeClick: () => void;
  uploading: boolean;
  solutionId: string | undefined;
}

const EmptyVideoState: React.FC<EmptyVideoStateProps> = ({
  onFileChange,
  onYouTubeClick,
  uploading,
  solutionId,
}) => {
  return (
    <div className="text-center py-12 border border-dashed rounded-md">
      <Video className="h-12 w-12 mx-auto text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium">Nenhum vídeo ainda</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Faça upload de vídeos ou adicione do YouTube
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <label htmlFor="video-upload-empty" className="cursor-pointer">
          <Input
            id="video-upload-empty"
            type="file"
            accept="video/*"
            onChange={onFileChange}
            className="hidden"
            disabled={uploading || !solutionId}
          />
          <Button size="sm" asChild disabled={!solutionId}>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              Fazer Upload
            </span>
          </Button>
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={onYouTubeClick}
          disabled={!solutionId}
        >
          <Youtube className="mr-2 h-4 w-4" />
          Adicionar do YouTube
        </Button>
      </div>
    </div>
  );
};

export default EmptyVideoState;
