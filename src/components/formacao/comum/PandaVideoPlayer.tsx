
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  autoplay?: boolean;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  title = "Vídeo",
  onProgress,
  onEnded,
  autoplay = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeId = `panda-player-${videoId}`;

  useEffect(() => {
    // Função para construir a URL do player
    const getEmbedUrl = () => {
      // Se o ID já contiver a URL completa, retorná-la
      if (videoId.includes('pandavideo.com.br')) {
        return videoId;
      }
      
      // Caso contrário, construir a URL de incorporação
      let url = `https://player.pandavideo.com.br/embed/${videoId}`;
      
      // Adicionar parâmetros de query, se necessário
      if (autoplay) {
        url += '?autoplay=1';
      }
      
      return url;
    };

    // Manipular mensagens do iframe (para eventos do player)
    const handleMessage = (event: MessageEvent) => {
      // Verificar se a mensagem é do Panda Video
      if (event.origin.includes('pandavideo.com.br')) {
        try {
          if (typeof event.data === 'string') {
            const data = JSON.parse(event.data);
            
            // Verificar eventos do player
            if (data.event === 'onProgress' && onProgress) {
              onProgress(data.progress || 0);
            } else if (data.event === 'onEnded' && onEnded) {
              onEnded();
            } else if (data.event === 'onReady') {
              setIsLoading(false);
            } else if (data.event === 'onError') {
              setError(`Erro ao carregar o vídeo: ${data.error || 'Desconhecido'}`);
              setIsLoading(false);
            }
          }
        } catch (e) {
          console.error('Erro ao processar mensagem do player:', e);
        }
      }
    };

    // Adicionar event listener para mensagens
    window.addEventListener('message', handleMessage);
    
    // Timeout para verificar se o player carregou
    const loadTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000); // 5 segundos

    // Limpar event listeners quando o componente for desmontado
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(loadTimeout);
    };
  }, [videoId, onProgress, onEnded, autoplay, isLoading]);

  return (
    <div className="relative w-full">
      <div className="aspect-video w-full bg-gray-100 overflow-hidden rounded-md">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500 p-4 text-center">
            {error}
          </div>
        ) : (
          <iframe
            id={iframeId}
            src={videoId.includes('pandavideo.com.br') ? videoId : `https://player.pandavideo.com.br/embed/${videoId}`}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => {
              setIsLoading(false);
            }}
            onError={() => {
              setError("Erro ao carregar o player de vídeo");
              setIsLoading(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
