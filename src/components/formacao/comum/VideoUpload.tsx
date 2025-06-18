
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadFileWithFallback } from '@/lib/supabase/storage';
import { Upload, X, Play, FileVideo, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface VideoUploadProps {
  value: string;
  onChange: (
    url: string, 
    videoType: string, 
    fileName?: string, 
    filePath?: string, 
    fileSize?: number,
    duration?: number,
    thumbnailUrl?: string
  ) => void;
  videoType?: string;
  disabled?: boolean;
}

export const VideoUpload = ({ value, onChange, videoType = 'upload', disabled = false }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const fileType = file.type.split('/')[0];
    if (fileType !== 'video') {
      setError("Por favor, selecione apenas arquivos de vídeo");
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de vídeo.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho do arquivo (300MB)
    const maxSize = 300 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`O vídeo é muito grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). O tamanho máximo é 300MB.`);
      toast({
        title: "Arquivo muito grande",
        description: "O vídeo excede o tamanho máximo de 300MB.",
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('Iniciando upload de vídeo...');
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `videos/${fileName}`;
      
      setUploadProgress(25);
      
      // Upload usando a função corrigida com 3 argumentos
      const { data, error: uploadError } = await uploadFileWithFallback(
        file,
        'learning_videos',
        filePath
      );

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      setUploadProgress(75);
      
      // Construir URL pública
      const publicUrl = `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/learning_videos/${filePath}`;

      setUploadProgress(100);
      
      console.log('Upload de vídeo concluído:', publicUrl);
      
      // Obter duração do vídeo (aproximada baseada no tamanho)
      const estimatedDuration = Math.ceil(file.size / (1024 * 1024 * 2)); // Estimativa simples
      
      onChange(
        publicUrl,
        'upload',
        file.name,
        filePath,
        file.size,
        estimatedDuration
      );
      
      toast({
        title: "Upload concluído",
        description: "O vídeo foi enviado com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Erro no upload:", error);
      const errorMessage = error.message || "Não foi possível enviar o vídeo. Tente novamente.";
      setError(errorMessage);
      toast({
        title: "Falha no upload",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveVideo = () => {
    onChange("", videoType);
    setError(null);
  };

  const handleFileClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-black">
          <video
            src={value}
            controls
            className="h-full w-full object-contain"
            onError={(e) => {
              setError("Não foi possível carregar o vídeo.");
              console.error("Erro ao carregar vídeo:", value);
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2"
            onClick={handleRemoveVideo}
            disabled={disabled || uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Enviando... {uploadProgress}%
              </span>
              <Progress value={uploadProgress} className="w-32" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileVideo className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Clique para adicionar um vídeo
              </span>
              <span className="text-xs text-muted-foreground">
                Tamanho máximo: 300MB
              </span>
            </div>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        disabled={uploading || disabled}
        className="hidden"
        id="video-upload"
      />
      
      {!value && !uploading && (
        <Button
          type="button"
          variant="outline"
          disabled={uploading || disabled}
          onClick={handleFileClick}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload de Vídeo
            </>
          )}
        </Button>
      )}
    </div>
  );
};
