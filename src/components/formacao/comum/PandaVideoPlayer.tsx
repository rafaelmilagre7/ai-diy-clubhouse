
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  autoplay?: boolean;
  startTime?: number;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  title = "Vídeo",
  onProgress,
  onEnded,
  autoplay = false,
  startTime = 0
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const iframeId = `panda-player-${videoId}`;
  
  // Função para construir a URL do player com parâmetros
  const getEmbedUrl = () => {
    // Se o ID já contiver a URL completa, extrair o ID
    if (videoId.includes('pandavideo.com.br')) {
      const matches = videoId.match(/\/embed\/([a-zA-Z0-9]+)/);
      if (matches && matches[1]) {
        const extractedId = matches[1];
        const params = new URLSearchParams();
        if (autoplay) params.append('autoplay', '1');
        if (startTime > 0) params.append('start', startTime.toString());
        
        return `https://player.pandavideo.com.br/embed/${extractedId}${params.toString() ? '?' + params.toString() : ''}`;
      }
      return videoId; // Se não conseguir extrair o ID, retorna a URL original
    }
    
    // Caso contrário, construir a URL de incorporação com o ID fornecido
    const params = new URLSearchParams();
    if (autoplay) params.append('autoplay', '1');
    if (startTime > 0) params.append('start', startTime.toString());
    
    return `https://player.pandavideo.com.br/embed/${videoId}${params.toString() ? '?' + params.toString() : ''}`;
  };

  useEffect(() => {
    // Reset do estado quando o videoId muda
    setIsLoading(true);
    setError(null);
    setPlayerReady(false);
    
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
              setPlayerReady(true);
              console.log('PandaVideo player pronto:', videoId);
            } else if (data.event === 'onError') {
              console.error('Erro do player PandaVideo:', data.error || 'Desconhecido');
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
        console.log('Timeout do player PandaVideo:', videoId);
        setIsLoading(false);
        // Só definimos erro se ainda não estiver pronto
        if (!playerReady) {
          setError('O player de vídeo está demorando para carregar. Tente atualizar a página.');
        }
      }
    }, 8000); // 8 segundos para timeout

    // Limpar event listeners quando o componente for desmontado
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(loadTimeout);
    };
  }, [videoId, onProgress, onEnded, autoplay, isLoading, playerReady]);

  // URL de incorporação segura
  const embedUrl = getEmbedUrl();
  
  return (
    <div className="relative w-full">
      <div className="aspect-video w-full bg-gray-100 overflow-hidden rounded-md">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500 p-4 text-center">
            <div className="max-w-md">
              <p className="font-medium mb-2">Erro no player de vídeo</p>
              <p className="text-sm">{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  setPlayerReady(false);
                  
                  // Forçar recriação do iframe
                  setTimeout(() => {
                    const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
                    if (iframe) {
                      iframe.src = embedUrl;
                    }
                  }, 100);
                }}
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : (
          <iframe
            id={iframeId}
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => {
              // Mesmo com o evento onLoad, ainda verificamos com o evento de mensagem do Panda para maior segurança
              console.log('Iframe do PandaVideo carregado:', videoId);
              // Se não recebermos evento onReady em até 3 segundos após o onLoad, assumimos que está pronto
              setTimeout(() => {
                if (isLoading && !playerReady) {
                  setIsLoading(false);
                }
              }, 3000);
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
