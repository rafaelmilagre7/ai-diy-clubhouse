
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { PandaVideoPlayer } from "./PandaVideoPlayer";

interface PandaVideoUploaderProps {
  onChange: (url: string, type: string, title: string, videoId: string, fileSize?: number, durationSeconds?: number, thumbnailUrl?: string) => void;
  initialValue?: {
    url?: string;
    title?: string;
    video_id?: string;
    thumbnail_url?: string;
    duration_seconds?: number;
  };
}

interface UploadError {
  message: string;
  details?: string;
}

export const PandaVideoUploader = ({ onChange, initialValue }: PandaVideoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState(initialValue?.title || "");
  const [videoId, setVideoId] = useState(initialValue?.video_id || "");
  const [videoUrl, setVideoUrl] = useState(initialValue?.url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialValue?.thumbnail_url || "");
  const [durationSeconds, setDurationSeconds] = useState(initialValue?.duration_seconds || 0);
  const [error, setError] = useState<UploadError | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(!!initialValue?.url);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Verificar tamanho do arquivo (limitado a 300MB pelo PandaVideo)
    const maxSize = 300 * 1024 * 1024; // 300MB em bytes
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande", {
        description: "O tamanho máximo permitido é 300MB"
      });
      return;
    }
    
    // Verificar tipo de arquivo
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não suportado", {
        description: "Apenas arquivos MP4, WebM, MOV e AVI são permitidos"
      });
      return;
    }
    
    // Usar o nome do arquivo como título se não foi fornecido
    if (!title) {
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setTitle(fileName);
    }
    
    // Iniciar upload
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadSuccess(false);
    
    try {
      // Criar FormData para upload
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title || file.name);
      formData.append("private", "false");
      
      console.log("Iniciando upload para Panda Video:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Configurar intervalo para simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = Math.min(prev + 5, 95);
          return next;
        });
      }, 1000);
      
      // Chamar a função Edge de upload
      const { data, error } = await supabase.functions.invoke('upload-panda-video', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (error) {
        throw error;
      }
      
      if (!data || !data.success || !data.video) {
        throw new Error("Resposta inválida do servidor");
      }
      
      console.log("Upload completo:", data);
      
      // Atualizar estado com dados do vídeo
      setVideoId(data.video.id);
      setVideoUrl(data.video.url);
      setThumbnailUrl(data.video.thumbnail_url || "");
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Notificar o componente pai sobre o novo vídeo
      onChange(
        data.video.url,
        "panda",
        data.video.title || title || file.name,
        data.video.id,
        file.size,
        data.video.duration || 0,
        data.video.thumbnail_url
      );
      
      toast.success("Upload concluído com sucesso!");
    } catch (err: any) {
      console.error("Erro no upload:", err);
      setError({
        message: "Erro ao fazer upload do vídeo",
        details: err.message || "Ocorreu um erro durante o upload"
      });
      setUploadProgress(0);
      toast.error("Falha no upload", {
        description: err.message || "Não foi possível completar o upload do vídeo"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const handleUploadClick = () => {
    // Gatilho para abrir o seletor de arquivos
    fileInputRef.current?.click();
  };
  
  const handleTryAgain = () => {
    setError(null);
    setUploadProgress(0);
  };
  
  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      <div className="space-y-2">
        <Input
          placeholder="Título do vídeo (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading}
          className="mb-4"
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enviando vídeo...</span>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        ) : uploadSuccess && videoId ? (
          <div className="space-y-4">
            <Alert variant="success" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Vídeo enviado com sucesso! Ele estará disponível após o processamento.
              </AlertDescription>
            </Alert>
            
            {videoUrl && (
              <div className="rounded-md overflow-hidden border">
                <PandaVideoPlayer videoId={videoId} title={title} />
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleUploadClick} 
              disabled={uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Substituir vídeo
            </Button>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">{error.message}</div>
                {error.details && <div className="text-sm">{error.details}</div>}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleTryAgain} 
              variant="outline" 
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed rounded-md text-center space-y-3 cursor-pointer" onClick={handleUploadClick}>
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Clique para selecionar um vídeo</p>
              <p className="text-sm text-muted-foreground">
                MP4, WebM, MOV ou AVI (máx. 300MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
