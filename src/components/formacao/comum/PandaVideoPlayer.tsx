
import { useEffect, useRef } from "react";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  onEnded?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

export const PandaVideoPlayer = ({
  videoId,
  title = "Vídeo",
  autoplay = false,
  onEnded,
  onProgress
}: PandaVideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerInitialized = useRef(false);
  
  // Configurar o listener para mensagens do player
  useEffect(() => {
    if (!onEnded && !onProgress) return;
    
    const handleMessageEvent = (event: MessageEvent) => {
      if (event.origin !== "https://player.pandavideo.com.br") {
        return;
      }
      
      try {
        const data = event.data;
        
        if (!data || typeof data !== 'string') return;
        
        const parsedData = JSON.parse(data);
        
        // Verificar se o evento é para o player específico
        if (parsedData.event === "onStateChange" && 
            parsedData.state === "ENDED" && 
            onEnded && 
            parsedData.videoId === videoId) {
          console.log("Vídeo terminado:", videoId);
          onEnded();
        }
        
        // Evento de progresso (enviado periodicamente)
        if (parsedData.event === "onTimeUpdate" && 
            onProgress && 
            parsedData.videoId === videoId) {
          const currentTime = parsedData.currentTime || 0;
          const duration = parsedData.duration || 0;
          onProgress(currentTime, duration);
        }
      } catch (error) {
        console.error("Erro ao processar mensagem do player Panda:", error);
      }
    };
    
    window.addEventListener('message', handleMessageEvent);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessageEvent);
    };
  }, [videoId, onEnded, onProgress]);
  
  // Inicializar o player quando montar
  useEffect(() => {
    if (playerInitialized.current) return;
    
    // Esta é uma função para garantir que o script do Panda Video esteja carregado
    const initPandaPlayer = () => {
      if (window.PandaPlayer) {
        window.PandaPlayer.init();
        playerInitialized.current = true;
      } else {
        // Se o script ainda não carregou, adicionar
        const script = document.createElement("script");
        script.src = "https://player.pandavideo.com.br/api.v2.js";
        script.async = true;
        script.onload = () => {
          if (window.PandaPlayer) {
            window.PandaPlayer.init();
            playerInitialized.current = true;
          }
        };
        document.body.appendChild(script);
      }
    };
    
    initPandaPlayer();
    
    // Cleanup
    return () => {
      playerInitialized.current = false;
    };
  }, []);

  return (
    <div className="relative w-full aspect-video">
      <iframe
        ref={iframeRef}
        id={`panda-${videoId}`}
        src={`https://player.pandavideo.com.br/embed/${videoId}?${autoplay ? 'autoplay=1' : ''}`}
        style={{ border: "none" }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full rounded-md"
        title={title}
      />
    </div>
  );
};

// Adicionar definição de tipo no Window global
declare global {
  interface Window {
    PandaPlayer?: {
      init: () => void;
      // pode ter outros métodos também
    };
  }
}
