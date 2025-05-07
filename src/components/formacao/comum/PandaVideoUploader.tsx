
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, FileVideo } from "lucide-react";
import { supabase } from "@/lib/supabase";
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
    
    try {
      setError(null);
      setIsUploading(true);
      setProgress(0);
      
      // Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado. Faça login para continuar.");
      }
      
      // Criar FormData para o upload
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", videoTitle || file.name);
      formData.append("private", "false");
      
      // Progress notification
      let toastId = toast.loading(`Enviando vídeo... 0%`, {
        id: "video-upload"
      });
      
      // Fazer upload para a edge function
      console.log("Iniciando upload para o Panda Video via edge function");
      const { data, error } = await supabase.functions.invoke("upload-panda-video", {
        method: 'POST',
        body: formData,
      });
      
      if (error) {
        console.error("Erro na edge function:", error);
        throw new Error(error.message || "Falha ao fazer upload do vídeo");
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
        file.size,
        videoInfo.duration || 0,
        videoInfo.thumbnail_url,
      );
      
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

  return (
    <div className="space-y-4">
      {videoData?.url && videoData?.video_id ? (
        <div className="space-y-3">
          <PandaVideoPlayer 
            videoId={videoData.video_id} 
            title={videoData.title || "Vídeo carregado"} 
          />
          <div className="text-sm text-center">
            <p className="font-medium text-green-600">Vídeo carregado com sucesso!</p>
            <p className="text-muted-foreground">{videoData.title}</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Label htmlFor="video-title">Título do vídeo</Label>
              <Input
                id="video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Ex: Introdução ao curso"
              />
              
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
                    
                    {isUploading && (
                      <div className="mt-3 flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                        <span className="text-sm text-primary">Enviando...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {error && (
                <p className="text-sm text-red-600 mt-2">
                  {error}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
