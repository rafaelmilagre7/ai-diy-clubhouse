
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Film, Loader2, AlertCircle } from "lucide-react";
import { setupLearningStorageBuckets } from "@/lib/supabase/storage";

interface VideoUploadCardProps {
  onVideoSelect: (video: File) => Promise<void>;
  title?: string;
  maxSize?: number; // em MB
  acceptedFormats?: string;
  disabled?: boolean;
}

export const VideoUploadCard: React.FC<VideoUploadCardProps> = ({
  onVideoSelect,
  title = "Upload de Vídeo",
  maxSize = 300, // 300MB
  acceptedFormats = "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska",
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  // Verificar configuração de armazenamento ao montar o componente
  React.useEffect(() => {
    const checkStorageConfig = async () => {
      try {
        setIsChecking(true);
        const result = await setupLearningStorageBuckets();
        setStorageReady(result.success);
        
        if (!result.success) {
          setError(`Configuração de armazenamento incompleta: ${result.message}`);
        }
      } catch (error) {
        console.error("Erro ao verificar buckets:", error);
        setError("Falha ao verificar armazenamento para upload de vídeos.");
      } finally {
        setIsChecking(false);
      }
    };
    
    checkStorageConfig();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("video/")) {
      setError("Por favor, selecione um arquivo de vídeo válido.");
      return;
    }

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`O arquivo é muito grande (${fileSizeMB.toFixed(2)}MB). O tamanho máximo é ${maxSize}MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      await onVideoSelect(file);
    } catch (error: any) {
      console.error("Erro ao processar o vídeo:", error);
      setError(error.message || "Ocorreu um erro ao processar o vídeo. Por favor, tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isChecking ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verificando configurações de armazenamento...</p>
          </div>
        ) : isUploading ? (
          <div className="p-8 text-center border-2 border-dashed rounded-lg">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
            <p className="font-medium">Processando vídeo...</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Isso pode levar alguns minutos dependendo do tamanho do arquivo.
            </p>
          </div>
        ) : (
          <div
            className="p-8 text-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => !disabled && document.getElementById("video-input")?.click()}
          >
            <input
              id="video-input"
              type="file"
              accept={acceptedFormats}
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || isUploading || !storageReady}
            />
            <Film className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">
              Clique para selecionar um vídeo
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Formatos aceitos: MP4, MOV, AVI, MKV
            </p>
            <p className="text-sm text-muted-foreground">
              Tamanho máximo: {maxSize}MB
            </p>
            
            <Button
              type="button"
              variant="default"
              className="mt-4"
              disabled={disabled || !storageReady}
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("video-input")?.click();
              }}
            >
              Selecionar Arquivo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoUploadCard;
