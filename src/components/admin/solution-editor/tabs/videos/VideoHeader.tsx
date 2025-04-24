
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, AlertCircle } from "lucide-react";
import VideoUploader from "../components/VideoUploader";

interface VideoHeaderProps {
  solutionId?: string;
  onYoutubeClick: () => void;
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({
  solutionId,
  onYoutubeClick,
  onFileUpload,
  isUploading,
  uploadProgress
}) => {
  const handleFileSelect = async (file: File) => {
    console.log("Arquivo selecionado no VideoHeader:", file.name);
    if (file) {
      try {
        await onFileUpload(file);
      } catch (error) {
        console.error("Erro ao fazer upload do arquivo:", error);
      }
    }
  };

  return (
    <Card className="border-2 border-[#0ABAB5]/20 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#0ABAB5]">Vídeos da solução</h2>
              <p className="text-muted-foreground mt-1">
                Adicione vídeos explicativos ou tutoriais para sua solução de IA
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={onYoutubeClick}
                variant="outline"
                className="gap-2"
                disabled={!solutionId || isUploading}
              >
                <Youtube className="h-4 w-4 text-red-500" />
                Adicionar do YouTube
              </Button>
            </div>
          </div>
          
          <VideoUploader
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            disabled={!solutionId}
          />

          {!solutionId && (
            <div className="flex items-center p-4 gap-2 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-800">
                Salve as informações básicas antes de adicionar vídeos.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoHeader;
