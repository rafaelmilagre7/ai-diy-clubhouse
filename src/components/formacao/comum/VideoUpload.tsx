import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Video, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from 'uuid';

interface VideoUploadProps {
  value: string | undefined;
  onChange: (
    url: string, 
    videoType: string, 
    fileName?: string, 
    filePath?: string, 
    fileSize?: number,
    duration?: number,
    thumbnailUrl?: string
  ) => void;
  bucketName: string;
  folderPath: string;
  maxSizeMB?: number;
  disabled?: boolean;
  videoType?: string; // Adicionando a propriedade videoType
}

export const VideoUpload = ({ 
  value, 
  onChange, 
  bucketName, 
  folderPath,
  maxSizeMB = 300,
  disabled = false,
  videoType = 'file' // Valor padrão
}: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
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

    // Validar tamanho do arquivo
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`O vídeo é muito grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). O tamanho máximo é ${maxSizeMB}MB.`);
      toast({
        title: "Arquivo muito grande",
        description: `O vídeo excede o tamanho máximo de ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      console.log(`Iniciando upload para bucket: ${bucketName}, pasta: ${folderPath}`);
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
      
      setProgress(25);
      
      // Upload direto para o Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      setProgress(75);
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      if (!urlData.publicUrl) {
        throw new Error("Não foi possível obter URL pública do arquivo");
      }

      setProgress(100);
      
      console.log('Upload concluído:', urlData.publicUrl);
      onChange(
        urlData.publicUrl, 
        'file', 
        file.name, 
        data.path, 
        file.size, 
        undefined, 
        undefined
      );
      
      toast({
        title: "Upload concluído",
        description: "O vídeo foi enviado com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      setError(error.message || "Não foi possível enviar o vídeo. Tente novamente.");
      toast({
        title: "Falha no upload",
        description: error.message || "Não foi possível enviar o vídeo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    onChange("", "file", undefined, undefined, undefined, undefined, undefined);
    setError(null);
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
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <video
            src={value}
            controls
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLVideoElement;
              target.src = ""; // Define um source vazio para evitar loops de erro
              setError("Não foi possível carregar o vídeo.");
              console.error("Erro ao carregar vídeo:", value);
            }}
          >
            Seu navegador não suporta a exibição de vídeos.
          </video>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2"
            onClick={handleRemoveVideo}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Enviando... {progress}%
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Video className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Clique para adicionar um vídeo
              </span>
              <span className="text-xs text-muted-foreground">
                Tamanho máximo: {maxSizeMB}MB
              </span>
            </div>
          )}
        </div>
      )}
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        disabled={uploading || disabled}
        className="hidden"
        id="video-upload"
      />
      {!value && (
        <Button
          type="button"
          variant="outline"
          disabled={uploading || disabled}
          onClick={() => document.getElementById("video-upload")?.click()}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Video className="mr-2 h-4 w-4" />
              Upload de Vídeo
            </>
          )}
        </Button>
      )}
    </div>
  );
};
