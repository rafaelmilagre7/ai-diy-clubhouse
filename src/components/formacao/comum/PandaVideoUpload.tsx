
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  Loader2, 
  Upload, 
  Video, 
  X 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";
import { bytesToSize } from "@/lib/utils";

interface PandaVideoUploadProps {
  value: string;
  videoData?: {
    id?: string; // Alterado aqui - agora id é opcional
    title?: string;
    description?: string;
    duration_seconds?: number;
    thumbnail_url?: string;
  };
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
}

export const PandaVideoUpload = ({
  value,
  videoData,
  onChange
}: PandaVideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const maxSizeMB = 500; // 500MB máximo

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo (vídeo)
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
    const maxSize = maxSizeMB * 1024 * 1024; // Converter para bytes
    if (file.size > maxSize) {
      setError(`O vídeo é muito grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). O tamanho máximo é ${maxSizeMB}MB.`);
      toast({
        title: "Arquivo muito grande",
        description: `O vídeo excede o tamanho máximo de ${maxSizeMB}MB. Por favor, selecione um vídeo menor.`,
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setVideoFile(file);
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError("Selecione um arquivo de vídeo para fazer upload");
      return;
    }

    setUploading(true);
    setProgress(5);
    setError(null);

    try {
      // Obter a JWT token para autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado. Faça login para continuar.");
      }

      // Criar FormData para envio do vídeo
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("title", videoFile.name.replace(/\.[^/.]+$/, ""));
      formData.append("private", "true");

      // Verificar tamanho antes do envio
      console.log(`Iniciando upload do vídeo: ${videoFile.name}, tamanho: ${bytesToSize(videoFile.size)}`);

      // Iniciar upload para a Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-panda-video`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        },
        body: formData
      });

      // Progresso artificial durante o upload
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 1000);

      if (!response.ok) {
        clearInterval(progressInterval);
        
        // Tente obter detalhes do erro, mesmo se não for um JSON válido
        let errorMsg = "Falha ao fazer upload do vídeo";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
          console.error("Erro detalhado:", errorData);
        } catch (parseError) {
          // Capture o texto bruto da resposta se não for JSON
          const errorText = await response.text();
          console.error("Resposta não-JSON do servidor:", errorText);
          errorMsg = `Erro no servidor (Código ${response.status}): ${errorText.substring(0, 100)}...`;
        }
        
        throw new Error(errorMsg);
      }

      // Tente fazer parse da resposta com tratamento de erro adequado
      let result;
      try {
        const responseText = await response.text();
        console.log("Resposta bruta:", responseText);
        
        // Verifique se a resposta não está vazia antes de fazer o parse
        if (!responseText || responseText.trim() === '') {
          throw new Error("Resposta vazia do servidor");
        }
        
        result = JSON.parse(responseText);
      } catch (parseError) {
        clearInterval(progressInterval);
        console.error("Erro ao analisar resposta JSON:", parseError);
        throw new Error(`Erro ao processar resposta do servidor: ${parseError.message}`);
      }

      clearInterval(progressInterval);
      setProgress(100);

      if (!result.success) {
        throw new Error(result.error || "Falha no upload do vídeo");
      }

      const videoInfo = result.video;
      
      console.log("Upload concluído com sucesso:", videoInfo);
      
      // Atualizar componente com informações do vídeo
      onChange(
        videoInfo.url,            // URL do player embedado
        "panda",                  // Tipo de vídeo
        videoFile.name,           // Nome do arquivo
        null,                     // Caminho do arquivo (não usado para Panda)
        videoFile.size,           // Tamanho do arquivo
        videoInfo.duration || 0,  // Duração em segundos
        videoInfo.thumbnail_url,  // URL da thumbnail
        videoInfo.id              // ID do vídeo no Panda
      );

      toast({
        title: "Upload concluído",
        description: "O vídeo foi enviado com sucesso e está sendo processado.",
        variant: "default",
      });

      // Limpar arquivo após upload bem-sucedido
      setVideoFile(null);
    } catch (error: any) {
      console.error("Erro ao fazer upload para Panda Video:", error);
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

  const handleClear = () => {
    onChange("", "", "", "", undefined, undefined, undefined, undefined);
    setVideoFile(null);
    setError(null);
  };

  // Renderizar preview se tivermos uma URL válida
  const hasValue = value && value.includes('pandavideo.com.br');

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasValue ? (
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden rounded-md border">
            <iframe
              src={value}
              title="Panda Video Player"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : videoFile ? (
        <div className="rounded-md border p-4">
          <div className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{videoFile.name}</p>
              <p className="text-xs text-muted-foreground">{bytesToSize(videoFile.size)}</p>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              disabled={uploading}
              onClick={() => setVideoFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {uploading && (
            <div className="mt-2 space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-center text-muted-foreground">
                {progress < 100 ? `Enviando... ${progress}%` : "Processando vídeo..."}
              </p>
            </div>
          )}

          {!uploading && (
            <Button
              type="button"
              variant="default"
              className="mt-2 w-full"
              onClick={handleUpload}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Enviar vídeo
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <div className="flex aspect-video w-full cursor-pointer items-center justify-center rounded-md border border-dashed hover:bg-gray-50">
            <label htmlFor="video-upload" className="flex h-full w-full flex-col items-center justify-center cursor-pointer">
              <div className="flex flex-col items-center justify-center py-5 text-center">
                <Video className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">Clique para adicionar um vídeo</p>
                <p className="text-xs text-muted-foreground mt-1">Máximo: {maxSizeMB}MB</p>
              </div>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            Formatos aceitos: MP4, MOV, AVI, etc.
          </p>
        </div>
      )}
      
      {uploading && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
