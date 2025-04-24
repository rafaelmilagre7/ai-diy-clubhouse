
import React, { useRef, useState } from "react";
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
  const [dragActive, setDragActive] = useState(false);

  // Função para acionar o clique no input quando o botão ou área de drop for clicada
  const handleButtonClick = (e: React.MouseEvent) => {
    // Importante para evitar que o evento de clique se propague quando clicar no botão interno
    e.stopPropagation(); 
    
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Função para lidar com o drop de arquivos
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || isUploading) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      console.log("Arquivo selecionado por drag & drop:", file.name);
      onFileSelect(file);
    }
  };

  // Função para lidar com a seleção de arquivo pelo input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Arquivo selecionado pelo input:", file.name);
      onFileSelect(file);
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    }
  };
  
  // Funções para lidar com eventos de drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setDragActive(true);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setDragActive(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 ${dragActive ? 'border-[#0ABAB5]' : 'border-dashed'} rounded-lg p-8 flex flex-col items-center justify-center transition-all ${
          dragActive ? 'bg-[#0ABAB5]/5' : 'bg-gray-50 hover:bg-gray-100'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={handleButtonClick}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
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
            onClick={handleButtonClick}
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
              // Mudar a cor para verde quando o upload estiver completo
              style={{
                "--bg-color": uploadProgress < 100 ? "#0ABAB5" : "#22c55e"
              } as any}
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
