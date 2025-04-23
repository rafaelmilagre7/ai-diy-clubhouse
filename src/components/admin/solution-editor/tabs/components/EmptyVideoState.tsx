
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, Youtube, Video } from "lucide-react";

interface EmptyVideoStateProps {
  onYoutubeClick: () => void;
  onFileUploadClick: () => void;
  solutionId?: string;
}

const EmptyVideoState: React.FC<EmptyVideoStateProps> = ({
  onYoutubeClick,
  onFileUploadClick,
  solutionId
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
      <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Video className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium mb-2">Nenhum vídeo ainda</h3>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Adicione vídeos para enriquecer sua solução de IA e facilitar o entendimento pelos usuários
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onFileUploadClick} 
          className="gap-2"
          disabled={!solutionId}
        >
          <Upload className="h-4 w-4" />
          Fazer upload de vídeo
        </Button>
        <Button 
          variant="outline" 
          onClick={onYoutubeClick}
          className="gap-2"
          disabled={!solutionId}
        >
          <Youtube className="h-4 w-4 text-red-500" />
          Adicionar do YouTube
        </Button>
      </div>
    </div>
  );
};

export default EmptyVideoState;
