
import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";
import { toast } from "sonner";
import { uploadFileWithFallback } from "@/lib/supabase/storage";

interface VideoUploadProps {
  value: string;
  onChange: (
    url: string, 
    videoType: string, 
    fileName?: string,
    filePath?: string,
    fileSize?: number,
    durationSeconds?: number,
    thumbnailUrl?: string,
    videoId?: string
  ) => void;
  videoType?: string;
  disabled?: boolean;
  videoData?: any;
}

export const VideoUpload = ({ 
  value, 
  onChange, 
  videoType = "video",
  disabled = false,
  videoData
}: VideoUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(value || null);
  
  // Função para obter duração do vídeo
  const getVideoDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      }
      
      video.src = URL.createObjectURL(file);
    });
  }, []);

  // Verificar tamanho máximo do arquivo
  const checkFileSize = (file: File, maxSizeInMB: number = 300) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Converter MB para bytes
    if (file.size > maxSizeInBytes) {
      return false;
    }
    return true;
  };
  
  // Verificar o formato do arquivo
  const checkFileFormat = (file: File) => {
    const validVideoFormats = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    return validVideoFormats.includes(file.type);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verificações de tamanho e formato
    if (!checkFileFormat(file)) {
      setUploadError("Formato de arquivo inválido. Use MP4, WebM, MOV ou AVI.");
      toast.error("Formato de arquivo inválido. Use MP4, WebM, MOV ou AVI.");
      return;
    }
    
    if (!checkFileSize(file, 300)) {
      setUploadError("O arquivo é muito grande. O tamanho máximo é 300MB.");
      toast.error("O arquivo é muito grande. O tamanho máximo é 300MB.");
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);
      
      // Obter duração do vídeo antes do upload
      const durationSeconds = await getVideoDuration(file);
      console.log(`Duração do vídeo: ${durationSeconds} segundos`);
      
      // Upload do arquivo
      const result = await uploadFileWithFallback(
        file,
        STORAGE_BUCKETS.LEARNING_VIDEOS,
        "videos",
        (progress) => setUploadProgress(progress)
      );
      
      if (result.publicUrl) {
        setVideoPreviewUrl(result.publicUrl);
        onChange(
          result.publicUrl, 
          "file", 
          file.name, 
          result.path, 
          file.size, 
          durationSeconds
        );
        toast.success("Upload de vídeo concluído com sucesso!");
      } else {
        throw new Error("Falha ao obter URL do arquivo após upload");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      setUploadError(`Erro no upload: ${error instanceof Error ? error.message : 'Falha desconhecida'}`);
      toast.error(`Erro no upload: ${error instanceof Error ? error.message : 'Falha desconhecida'}`);
    } finally {
      setIsUploading(false);
      // Resetar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
        className="w-full h-32 flex flex-col gap-2 justify-center items-center border-dashed"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Fazendo upload... {uploadProgress}%</span>
          </>
        ) : (
          <>
            <span className="text-lg">Clique para selecionar um vídeo</span>
            <span className="text-sm text-muted-foreground">
              MP4, WebM, MOV (max. 300MB)
            </span>
          </>
        )}
      </Button>
      
      {isUploading && (
        <Progress value={uploadProgress} className="h-2" />
      )}
      
      {uploadError && (
        <div className="text-sm text-red-500">{uploadError}</div>
      )}
      
      {videoPreviewUrl && !isUploading && (
        <div className="relative rounded-md overflow-hidden border">
          <video 
            src={videoPreviewUrl}
            controls
            className="w-full h-auto"
          />
        </div>
      )}
    </div>
  );
};
