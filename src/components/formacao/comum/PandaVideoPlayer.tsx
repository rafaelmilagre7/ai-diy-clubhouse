
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
}

export const PandaVideoPlayer = ({ 
  videoId, 
  title = "Vídeo",
  className = "",
  onProgress,
  onEnded
}: PandaVideoPlayerProps) => {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Configurar comunicação com o iframe do Panda Video
  useEffect(() => {
    if (!onProgress && !onEnded) return;
    
    // Função para receber mensagens do iframe
    const handleMessage = (event: MessageEvent) => {
      try {
        // Verificar se a mensagem vem do Panda Video
        if (event.origin !== 'https://player.pandavideo.com.br') return;
        
        // Tentar interpretar a mensagem como JSON
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Verificar o tipo de evento
        if (data.event === 'timeupdate' && onProgress && typeof data.progress === 'number') {
          // Converter para porcentagem (0-100)
          const progressPercent = Math.round(data.progress * 100);
          onProgress(progressPercent);
        }
        
        if (data.event === 'ended' && onEnded) {
          onEnded();
        }
      } catch (error) {
        console.error("Erro ao processar mensagem do player:", error);
      }
    };
    
    // Adicionar listener para mensagens
    window.addEventListener('message', handleMessage);
    
    // Remover listener quando o componente for desmontado
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onProgress, onEnded]);

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <div className={`aspect-video ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <iframe 
          ref={iframeRef}
          src={`https://player.pandavideo.com.br/embed/?v=${videoId}`}
          title={title}
          onLoad={() => setLoading(false)}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
        />
      </div>
    </div>
  );
};
