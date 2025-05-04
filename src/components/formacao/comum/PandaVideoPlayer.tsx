
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  onProgress?: (progress: number) => void;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  title,
  onProgress
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estruturar a URL do player do Panda Video
  const embedUrl = `https://player.pandavideo.com.br/embed/${videoId}`;

  useEffect(() => {
    // Simulação de carregamento para evitar flash de conteúdo
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [videoId]);

  // Lidar com mensagens do iframe do Panda Video para rastreamento de progresso
  useEffect(() => {
    if (!onProgress) return;

    const handleMessage = (event: MessageEvent) => {
      // Verificar se a mensagem é do player do Panda Video
      if (event.origin === "https://player.pandavideo.com.br") {
        try {
          const data = JSON.parse(event.data);
          
          // Verificar se é um evento de progresso
          if (data.event === "timeupdate" && data.video === videoId) {
            const currentPercentage = (data.currentTime / data.duration) * 100;
            
            // Atualizar progresso em marcos específicos
            if (currentPercentage >= 25 && currentPercentage < 50) {
              onProgress(25);
            } else if (currentPercentage >= 50 && currentPercentage < 75) {
              onProgress(50);
            } else if (currentPercentage >= 75 && currentPercentage < 100) {
              onProgress(75);
            } else if (currentPercentage >= 99) {
              onProgress(100);
            }
          }
          
          // Verificar se o vídeo foi concluído
          if (data.event === "ended" && data.video === videoId) {
            onProgress(100);
          }
        } catch (e) {
          // Ignorar erro de parsing JSON
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [videoId, onProgress]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-rose-50 flex items-center justify-center">
            <p className="text-rose-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={title || "Vídeo"}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          ></iframe>
        </div>
      </CardContent>
    </Card>
  );
};
