
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, FileVideo, X, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { PandaVideoPlayer } from "./PandaVideoPlayer";

// Interface para os dados do vídeo
interface VideoDataProps {
  url?: string;
  title?: string;
  video_id?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
}

interface PandaVideoUploaderProps {
  onChange: (
    url: string,
    videoType: string,
    title: string,
    videoId: string,
    fileSize?: number,
    durationSeconds?: number,
    thumbnailUrl?: string
  ) => void;
  initialValue?: VideoDataProps;
}

export function PandaVideoUploader({ onChange, initialValue }: PandaVideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoTitle, setVideoTitle] = useState(initialValue?.title || "");
  const [videoData, setVideoData] = useState<VideoDataProps | null>(initialValue || null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validação do tamanho do arquivo (300MB)
    const maxSize = 300 * 1024 * 1024; // 300MB em bytes
    if (file.size > maxSize) {
      toast.error("O arquivo é muito grande", {
        description: "O tamanho máximo permitido é 300MB."
      });
      return;
    }
    
    // Validação de tipo de arquivo
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato não suportado", {
        description: "Por favor, envie um vídeo em formato MP4, WebM, MOV ou MKV."
      });
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    // Se não houver título definido, use o nome do arquivo como título
    if (!videoTitle) {
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setVideoTitle(fileNameWithoutExtension);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) {
      setError("Selecione um arquivo para enviar");
      return;
    }

    if (!videoTitle.trim()) {
      setError("Digite um título para o vídeo");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado. Faça login para continuar.");
      }
      
      // Criar FormData para o upload
      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append("title", videoTitle);
      formData.append("private", "false");
      
      // Progress notification
      let toastId = toast.loading(`Enviando vídeo... 0%`, {
        id: "video-upload"
      });
      
      // Iniciar o progresso artificial
      let progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
        
        toast.loading(`Enviando vídeo... ${progress}%`, {
          id: toastId
        });
      }, 1000);

      console.log("Iniciando upload para o Panda Video via edge function");
      
      // Fazer upload para a edge function
      const { data, error: uploadError } = await supabase.functions.invoke("upload-panda-video", {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (uploadError) {
        console.error("Erro na edge function:", uploadError);
        throw new Error(uploadError.message || "Falha ao fazer upload do vídeo");
      }
      
      if (!data || !data.success || !data.video) {
        console.error("Resposta inválida da API:", data);
        throw new Error("Resposta inválida da API de upload");
      }
      
      toast.dismiss(toastId);
      toast.success("Upload concluído!", {
        description: "Seu vídeo foi enviado com sucesso e estará disponível em breve."
      });
      
      console.log("Upload concluído com sucesso:", data);
      
      const videoInfo = data.video;
      setProgress(100);
      setVideoData({
        url: videoInfo.url,
        title: videoInfo.title,
        video_id: videoInfo.id,
        thumbnail_url: videoInfo.thumbnail_url,
        duration_seconds: videoInfo.duration || 0,
      });
      
      // Chamar callback com os dados do vídeo
      onChange(
        videoInfo.url,
        "panda",
        videoInfo.title,
        videoInfo.id,
        selectedFile.size,
        videoInfo.duration || 0,
        videoInfo.thumbnail_url,
      );
      
      // Limpar arquivo selecionado após upload
      setSelectedFile(null);
      
    } catch (err: any) {
      console.error("Erro ao fazer upload:", err);
      const errorMessage = err.message || "Ocorreu um erro no upload do vídeo";
      toast.error("Erro no upload", {
        description: errorMessage
      });
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleClear = () => {
    onChange("", "", "", "", undefined, undefined, undefined);
    setVideoData(null);
    setVideoTitle("");
    setSelectedFile(null);
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

      {videoData?.url && videoData?.video_id ? (
        <div className="space-y-3">
          <PandaVideoPlayer 
            videoId={videoData.video_id} 
            title={videoData.title || "Vídeo carregado"} 
          />
          <div className="text-sm flex justify-between items-center">
            <div>
              <p className="font-medium text-green-600">Vídeo carregado com sucesso!</p>
              <p className="text-muted-foreground">{videoData.title}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleClear}
            >
              <X className="h-4 w-4 mr-1" /> Remover
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="video-title">Título do vídeo</Label>
                <Input
                  id="video-title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Ex: Introdução ao curso"
                  className="mt-1"
                  disabled={isUploading}
                />
              </div>
              
              {selectedFile ? (
                <div className="mt-4 border border-border rounded-lg p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileVideo className="h-5 w-5 text-primary mr-2" />
                        <div>
                          <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearSelection}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isUploading && (
                      <div className="space-y-2 mt-2">
                        <Progress value={progress} />
                        <p className="text-xs text-center text-muted-foreground">
                          {progress < 100 ? `Enviando... ${progress}%` : "Processando..."}
                        </p>
                      </div>
                    )}
                    
                    {!isUploading && (
                      <Button 
                        type="button" 
                        className="mt-2 w-full"
                        onClick={handleStartUpload}
                        disabled={!videoTitle.trim()}
                      >
                        Iniciar upload
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="relative border-2 border-dashed border-primary/40 rounded-lg p-6 flex flex-col items-center justify-center hover:border-primary/70 transition-colors cursor-pointer">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    
                    <div className="flex flex-col items-center justify-center text-center">
                      <FileVideo className="mb-2 h-8 w-8 text-primary/70" />
                      <p className="text-sm font-medium mb-1">Clique para selecionar um vídeo</p>
                      <p className="text-xs text-muted-foreground">MP4, WebM ou MOV (max. 300MB)</p>
                    </div>
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
