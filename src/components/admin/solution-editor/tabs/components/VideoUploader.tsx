
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, Video } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isUploading) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      console.log("Arquivo selecionado por drag & drop:", file.name);
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Arquivo selecionado pelo input:", file.name);
      onFileSelect(file);
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    }
  };
  
  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={handleButtonClick}
        onDrop={handleFileDrop}
        onDragOver={preventDefaults}
        onDragEnter={preventDefaults}
        onDragLeave={preventDefaults}
        data-testid="video-upload-dropzone"
      >
        <input
          ref={fileInputRef}
          id="video-file-input"
          type="file"
          accept="video/mp4,video/webm,video/mov,video/avi"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          data-testid="video-file-input"
        />
        
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-[#0ABAB5]/10 flex items-center justify-center mb-4">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin" />
            ) : (
              <Video className="h-8 w-8 text-[#0ABAB5]" />
            )}
          </div>
          
          <h3 className="text-lg font-medium mb-1">Upload de vídeo</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Arraste e solte seu arquivo de vídeo aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Formatos suportados: MP4, WEBM, MOV (Máx: 500MB)
          </p>
          
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
            disabled={disabled || isUploading}
            data-testid="video-upload-button"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Selecionar arquivo
              </>
            )}
          </Button>
        </div>

        {isUploading && (
          <div className="w-full mt-6 space-y-2">
            <Progress 
              value={uploadProgress} 
              className="h-2 w-full"
              indicatorClassName={uploadProgress < 100 ? "bg-[#0ABAB5]" : "bg-green-500"}
            />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Enviando vídeo...</span>
              <span className="text-sm font-medium">{uploadProgress.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;
