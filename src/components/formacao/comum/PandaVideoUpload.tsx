
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface PandaVideoUploadProps {
  value: string;
  onChange: (
    url: string, 
    type: string, 
    fileName?: string,
    filePath?: string,
    fileSize?: number,
    duration_seconds?: number,
    thumbnail_url?: string,
    videoId?: string
  ) => void;
  videoData?: {
    title?: string;
    description?: string;
    fileName?: string;
    filePath?: string;
    fileSize?: number;
  };
}

export const PandaVideoUpload: React.FC<PandaVideoUploadProps> = ({
  value,
  onChange,
  videoData
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Validar tipo de arquivo
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Formato de arquivo não suportado. Use MP4, WebM, MOV ou AVI.');
      return;
    }
    
    // Validar tamanho (300MB max)
    const maxSize = 300 * 1024 * 1024; // 300MB em bytes
    if (selectedFile.size > maxSize) {
      setError(`Arquivo muito grande (${Math.round(selectedFile.size / (1024 * 1024))}MB). Tamanho máximo: 300MB.`);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Selecione um arquivo para fazer upload.');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Simulamos a chamada para uma função edge que enviaria o vídeo para o Panda Video
      // Em um ambiente real, esta seria uma chamada para o Supabase Edge Function
      
      // Simular o progresso do upload
      const simulateProgress = () => {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.random() * 10;
          if (currentProgress > 95) {
            currentProgress = 95; // Mantenha em 95% até a conclusão
            clearInterval(interval);
          }
          setProgress(Math.min(currentProgress, 95));
        }, 500);
        
        return interval;
      };
      
      const progressInterval = simulateProgress();
      
      // Simular uma resposta de API após um tempo
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        
        // Dados simulados que seriam retornados pela API do Panda
        const mockPandaResponse = {
          id: `panda-${Date.now()}`,
          title: videoData?.title || file.name,
          url: `https://player.pandavideo.com.br/embed/?v=panda-${Date.now()}`,
          thumbnail: `https://placekitten.com/640/360?t=${Date.now()}`,
          duration: Math.floor(Math.random() * 300) + 60 // Duração simulada entre 60 e 360 segundos
        };
        
        // Chamar o callback com os dados simulados
        onChange(
          mockPandaResponse.url,
          'panda',
          file.name,
          mockPandaResponse.id,
          file.size,
          mockPandaResponse.duration,
          mockPandaResponse.thumbnail,
          mockPandaResponse.id
        );
        
        setUploading(false);
        setFile(null);
        
        // Limpar o input de arquivo
        const fileInput = document.getElementById('video-file-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }, 3000);
      
    } catch (err: any) {
      console.error("Erro ao fazer upload do vídeo:", err);
      setError(err.message || 'Erro ao fazer upload do vídeo');
      setUploading(false);
      setProgress(0);
    }
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {value && !uploading ? (
        <div className="border rounded-md p-3 bg-muted/20 space-y-2">
          <p className="text-sm font-medium">Vídeo já carregado</p>
          <p className="text-xs text-muted-foreground">
            {videoData?.fileName || "Arquivo de vídeo"}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById('video-file-input')?.click()}
          >
            Substituir vídeo
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-2">
            <label htmlFor="video-file-input" className="text-sm font-medium flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md py-6 px-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {file ? file.name : "Clique para selecionar um arquivo de vídeo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  MP4, WebM ou MOV (máx. 300MB)
                </p>
              </div>
              <Input 
                id="video-file-input" 
                type="file" 
                className="hidden" 
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" 
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
          
          {file && !uploading && (
            <div className="flex items-center justify-between bg-secondary/50 px-3 py-2 rounded-md">
              <div className="truncate max-w-[70%]">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(file.size / (1024 * 1024) * 10) / 10} MB
                </p>
              </div>
              <Button onClick={handleUpload} disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          )}
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span>Enviando vídeo...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando {file?.name}...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
