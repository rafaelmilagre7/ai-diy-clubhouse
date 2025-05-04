
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  className?: string;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  title,
  onProgress,
  onEnded,
  className
}) => {
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const embedUrl = `https://player.pandavideo.com.br/embed/${videoId}`;
  
  useEffect(() => {
    let progressInterval: number;
    
    const setupMessageListener = () => {
      // Handler para eventos de mensagem do player do Panda Video
      const handleMessage = (event: MessageEvent) => {
        try {
          if (!event.data || typeof event.data !== 'string') return;
          
          // Verificar se a mensagem vem do Panda Video
          if (!event.data.startsWith('{') || !event.data.includes('pandavideo')) return;
          
          const data = JSON.parse(event.data);
          
          // Verificar se a mensagem é do player do Panda Video
          if (!data.event || !data.event.startsWith('pandavideo')) return;
          
          console.log("Mensagem recebida do player Panda:", data);
          
          // Eventos de progresso
          if (data.event === 'pandavideo.playing') {
            setLoading(false);
            
            // Configurar intervalo para monitorar o progresso
            if (onProgress && !progressInterval) {
              progressInterval = window.setInterval(() => {
                if (data.progress && typeof data.progress === 'number') {
                  onProgress(data.progress);
                }
              }, 5000);
            }
          }
          
          // Reporte de progresso
          if (data.event === 'pandavideo.progress' && onProgress) {
            if (data.progress && typeof data.progress === 'number') {
              onProgress(data.progress);
            }
          }
          
          // Evento de vídeo finalizado
          if (data.event === 'pandavideo.ended' && onEnded) {
            if (progressInterval) {
              clearInterval(progressInterval);
            }
            
            // Reportar progresso de 100% antes de finalizar
            if (onProgress) {
              onProgress(100);
            }
            
            onEnded();
          }
        } catch (error) {
          console.error("Erro ao processar mensagem do player Panda:", error);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      return () => {
        window.removeEventListener('message', handleMessage);
        if (progressInterval) {
          clearInterval(progressInterval);
        }
      };
    };
    
    const cleanup = setupMessageListener();
    
    return () => {
      cleanup();
    };
  }, [videoId, onProgress, onEnded]);
  
  // Simular um carregamento mais rápido para melhor UX
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!iframeLoaded) {
        setLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [iframeLoaded]);
  
  return (
    <Card className={className}>
      <CardContent className="p-0 relative">
        {loading && (
          <div className="absolute inset-0 z-10">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        <div className="aspect-video">
          <iframe 
            src={embedUrl}
            className="w-full h-full"
            title={title || `Vídeo ${videoId}`}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={() => {
              setIframeLoaded(true);
              setLoading(false);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

