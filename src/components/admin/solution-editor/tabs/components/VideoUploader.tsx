
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, Video, Youtube, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<string>("upload");

  // Função para acionar o clique no input quando o botão for clicado
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    if (!disabled && !isUploading && fileInputRef.current) {
      console.log("[VideoUploader] Clique no botão de upload detectado");
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
      console.log("[VideoUploader] Arquivo selecionado por drag & drop:", file.name);
      onFileSelect(file);
    }
  };

  // Função para lidar com a seleção de arquivo pelo input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("[VideoUploader] Arquivo selecionado pelo input:", file.name);
      onFileSelect(file);
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Plus className="h-5 w-5 mr-2 text-[#0ABAB5]" />
        Adicionar novo vídeo
      </h3>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="upload" disabled={disabled || isUploading}>
            <Upload className="h-4 w-4 mr-2" />
            Upload de Arquivo
          </TabsTrigger>
          <TabsTrigger value="youtube" disabled={disabled || isUploading}>
            <Youtube className="h-4 w-4 mr-2" />
            Link do YouTube
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
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
              accept="video/mp4,video/webm,video/mov,video/avi,video/quicktime"
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
                  e.stopPropagation(); // Importante para evitar duplo acionamento
                  handleButtonClick(e);
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
                />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Enviando vídeo...</span>
                  <span className="text-sm font-medium">{uploadProgress.toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="youtube">
          <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Youtube className="h-8 w-8 text-red-500" />
              </div>
              
              <h3 className="text-lg font-medium mb-1">Vídeo do YouTube</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Adicione vídeos do YouTube de forma rápida e simples
              </p>
              
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  // Código para abrir o diálogo do YouTube - já configurado no componente pai
                  const event = new CustomEvent('openYouTubeDialog');
                  document.dispatchEvent(event);
                }}
                disabled={disabled}
              >
                <Youtube className="h-4 w-4" />
                Adicionar vídeo do YouTube
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
          
      {!disabled && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Os vídeos adicionados aparecerão na lista abaixo
        </p>
      )}
          
      {!solution?.id && (
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
