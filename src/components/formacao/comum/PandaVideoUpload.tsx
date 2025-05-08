
import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  Loader2, 
  Upload, 
  Video, 
  X,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { bytesToSize } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { PandaVideoPlayer } from "./PandaVideoPlayer";

interface PandaVideoUploadProps {
  value: string;
  videoData?: {
    id?: string;
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
  disabled?: boolean;
}

export const PandaVideoUpload = ({
  value,
  videoData,
  onChange,
  disabled = false
}: PandaVideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [playerError, setPlayerError] = useState<string | null>(null);
  const { toast } = useToast();

  const maxSizeMB = 500; // 500MB máximo
  const maxRetries = 3;   // Número máximo de tentativas
  
  // Inicializar título a partir dos dados do vídeo, se disponíveis
  useEffect(() => {
    if (videoData?.title) {
      setVideoTitle(videoData.title);
    }
  }, [videoData]);

  const handleCancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setUploading(false);
      setProgress(0);
      toast({
        title: "Upload cancelado",
        description: "O upload do vídeo foi cancelado pelo usuário."
      });
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limpar erros anteriores
    setError(null);
    setPlayerError(null);

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

    // Definir título do arquivo automaticamente (sem extensão)
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setVideoTitle(fileName);
    
    setVideoFile(file);
    setRetryCount(0);
    
    // Criar URL de pré-visualização para o vídeo selecionado
    if (videoPreviewRef.current) {
      const objectURL = URL.createObjectURL(file);
      videoPreviewRef.current.src = objectURL;
      
      // Limpar URL quando o componente for desmontado
      return () => {
        URL.revokeObjectURL(objectURL);
      };
    }
  };

  const uploadToPandaVideo = async (file: File, title: string): Promise<any> => {
    try {
      // Verificar a sessão antes de prosseguir
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado. Faça login para continuar.");
      }

      // Verificar se o token de acesso está presente
      if (!session.access_token) {
        throw new Error("Token de autenticação não encontrado. Tente fazer login novamente.");
      }

      // Criar FormData para envio do vídeo
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title || file.name.replace(/\.[^/.]+$/, ""));
      formData.append("private", "true");

      // Verificar tamanho antes do envio
      console.log(`Iniciando upload do vídeo: ${file.name}, tamanho: ${bytesToSize(file.size)}, tipo: ${file.type}`);

      // URL da Edge Function do Supabase
      const projectId = 'zotzvtepvpnkcoobdubt';
      const functionUrl = `https://${projectId}.functions.supabase.co/upload-panda-video`;
      console.log("Chamando Edge Function:", functionUrl);
      
      // Adicionar tempo limite estendido para vídeos maiores
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 600000); // 10 minutos de timeout
      
      // Iniciar upload para a Edge Function com timeout estendido
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        },
        body: formData,
        signal: abortControllerRef.current.signal
      });
      
      clearTimeout(timeoutId);
      
      // Verificar resposta HTTP (status code)
      if (!response.ok) {
        // Clone a resposta antes de tentar lê-la
        const clonedResponse = response.clone();
        let errorMessage = "";
        
        // Tentar obter detalhes do erro como JSON primeiro
        try {
          const errorData = await response.json();
          console.error("Erro detalhado (JSON):", errorData);
          
          if (errorData.error?.includes('autenticação') || 
              errorData.error?.includes('auth') || 
              errorData.error?.includes('token') ||
              response.status === 401) {
            errorMessage = "Falha na autenticação. Verifique se está logado.";
          } else if (response.status === 500) {
            errorMessage = "Erro interno do servidor. Tente novamente em alguns instantes.";
          } else {
            errorMessage = errorData.error || errorData.message || "Falha ao fazer upload do vídeo";
          }
        } catch (jsonError) {
          // Se falhar ao ler como JSON, tente ler como texto
          try {
            const errorText = await clonedResponse.text();
            console.error("Resposta não-JSON do servidor:", errorText);
            
            if (response.status === 500) {
              errorMessage = "Erro interno do servidor. Tente novamente em alguns instantes.";
            } else if (response.status === 401) {
              errorMessage = "Erro de autenticação. Tente fazer login novamente.";
            } else {
              errorMessage = `Erro no servidor (Código ${response.status})`;
            }
          } catch (textError) {
            errorMessage = `Erro na comunicação com o servidor (Código ${response.status})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Esta é a forma segura de ler o corpo da resposta uma única vez
      const responseText = await response.text();
      console.log("Resposta bruta do servidor:", responseText);
      
      // Verificar se o texto da resposta não está vazio antes de fazer o parse
      if (!responseText || responseText.trim() === '') {
        throw new Error("Resposta vazia do servidor");
      }
      
      // Tentar fazer parse da resposta como JSON
      const result = JSON.parse(responseText);

      if (!result.success) {
        throw new Error(result.error || "Falha no upload do vídeo");
      }

      return result.video;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error("Upload cancelado pelo usuário");
      }
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError("Selecione um arquivo de vídeo para fazer upload");
      return;
    }

    // Verificar se temos um título
    const title = videoTitle.trim() || videoFile.name.replace(/\.[^/.]+$/, "");

    setUploading(true);
    setProgress(5);
    setError(null);
    setRetrying(false);

    try {
      // Simular progresso durante upload
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 5;
        });
      }, 1000);

      // Fazer upload para o PandaVideo
      const videoInfo = await uploadToPandaVideo(videoFile, title);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log("Upload concluído com sucesso:", videoInfo);
      
      // Atualizar componente com informações do vídeo
      onChange(
        videoInfo.url,            // URL do player embedado
        "panda",                  // Tipo de vídeo
        videoFile.name,           // Nome do arquivo
        videoInfo.id,             // ID do vídeo no Panda (armazenado no campo filePath para reutilização)
        videoFile.size,           // Tamanho do arquivo
        videoInfo.duration || 0,  // Duração em segundos
        videoInfo.thumbnail_url,  // URL da thumbnail
        videoInfo.id              // ID do vídeo no Panda
      );

      toast({
        title: "Upload concluído",
        description: "O vídeo foi enviado com sucesso e está sendo processado.",
      });

      // Limpar arquivo após upload bem-sucedido
      setVideoFile(null);
    } catch (error: any) {
      console.error("Erro ao fazer upload para Panda Video:", error);
      
      // Verificar se devemos tentar novamente
      if (retryCount < maxRetries && !error.message?.includes("cancelado")) {
        setProgress(0);
        setRetrying(true);
        setRetryCount(prevCount => prevCount + 1);
        
        toast({
          title: "Tentando novamente",
          description: `Tentativa ${retryCount + 1} de ${maxRetries}. Por favor, aguarde...`,
          variant: "default",
        });
        
        // Esperar antes de tentar novamente (backoff exponencial)
        const retryDelay = Math.pow(2, retryCount) * 2000;
        setTimeout(() => {
          setRetrying(false);
          setUploading(false);
          handleUpload();
        }, retryDelay);
        return;
      }
      
      // Mensagem mais específica baseada no erro
      let errorMessage = error.message || "Não foi possível enviar o vídeo. Tente novamente.";
      
      setError(errorMessage);
      toast({
        title: "Falha no upload",
        description: errorMessage,
        variant: "destructive",
      });
      setProgress(0);
      setUploading(false);
    }
  };

  const handleClear = () => {
    onChange("", "", "", "", undefined, undefined, undefined, undefined);
    setVideoFile(null);
    setError(null);
    setPlayerError(null);
    setVideoTitle("");
    setProgress(0);
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

      {playerError && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{playerError}</AlertDescription>
        </Alert>
      )}

      {hasValue ? (
        <div className="space-y-4">
          <div className="relative">
            <PandaVideoPlayer 
              videoId={videoData?.id || value.split('embed/')[1]?.split('?')[0] || ''}
              title={videoData?.title || videoTitle || "Vídeo"}
              onError={setPlayerError}
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute right-2 top-2"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <Input 
              value={videoTitle} 
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Título do vídeo"
              disabled={disabled}
            />
          </div>
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
              disabled={uploading || retrying || disabled}
              onClick={() => setVideoFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3">
            <Input 
              value={videoTitle} 
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Título do vídeo"
              disabled={uploading || retrying || disabled}
              className="mb-3"
            />
          </div>

          {(uploading || retrying) && (
            <div className="mt-2 space-y-2">
              <Progress value={retrying ? 0 : progress} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {retrying ? (
                    <span className="flex items-center">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Preparando tentativa {retryCount} de {maxRetries}...
                    </span>
                  ) : progress < 100 ? (
                    `Enviando... ${progress.toFixed(0)}%`
                  ) : (
                    "Processando vídeo..."
                  )}
                </span>
                
                {progress > 0 && progress < 100 && !retrying && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCancelUpload}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          )}

          {!uploading && !retrying && (
            <Button
              type="button"
              variant="default"
              className="mt-2 w-full"
              onClick={handleUpload}
              disabled={disabled}
            >
              <Upload className="mr-2 h-4 w-4" />
              Enviar vídeo
            </Button>
          )}
          
          {/* Video preview para debug - oculto */}
          <video ref={videoPreviewRef} className="hidden" controls />
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
                disabled={uploading || retrying || disabled}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            Formatos aceitos: MP4, MOV, AVI, WebM
          </p>
        </div>
      )}
      
      {(uploading || retrying) && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
