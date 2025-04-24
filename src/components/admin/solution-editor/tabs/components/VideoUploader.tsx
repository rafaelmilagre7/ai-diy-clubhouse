
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadArea } from "./upload/FileUploadArea";
import { YouTubeArea } from "./upload/YouTubeArea";

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  disabled: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  onFileSelect,
  isUploading,
  uploadProgress,
  disabled
}) => {
  const [activeTab, setActiveTab] = useState<string>("upload");

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Plus className="h-5 w-5 mr-2 text-[#0ABAB5]" />
        Adicionar novo vídeo
      </h3>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="upload" disabled={disabled || isUploading}>
            Upload de Arquivo
          </TabsTrigger>
          <TabsTrigger value="youtube" disabled={disabled || isUploading}>
            Link do YouTube
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <FileUploadArea
            onFileSelect={onFileSelect}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            disabled={disabled}
          />
        </TabsContent>

        <TabsContent value="youtube">
          <YouTubeArea
            onYouTubeClick={() => {
              const event = new CustomEvent('openYouTubeDialog');
              document.dispatchEvent(event);
            }}
            disabled={disabled}
          />
        </TabsContent>
      </Tabs>
          
      {!disabled && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Os vídeos adicionados aparecerão na lista abaixo
        </p>
      )}
          
      {disabled && (
        <div className="flex items-center p-4 gap-2 bg-amber-50 border border-amber-200 rounded-md mt-4">
          <p className="text-sm text-amber-800">
            Salve as informações básicas antes de adicionar vídeos.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
