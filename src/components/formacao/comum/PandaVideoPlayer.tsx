
import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  className?: string;
  onError?: (error: string) => void;
  startAt?: number;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  title,
  autoplay = false,
  onProgress,
  onEnded,
  className = '',
  onError,
  startAt = 0
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerReadyRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Simular carregamento para evitar flash de conteúdo
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [videoId]);
  
  // Reset state on videoId change
  useEffect(() => {
    setLoading(true);
    setError(null);
    playerReadyRef.current = false;
  }, [videoId]);
  
  // Configurar comunicação com o player do Panda Video
  useEffect(() => {
    if (!onProgress && !onEnded && !startAt) return;
    
    // Função para receber mensagens do iframe
    const handleMessage = (event: MessageEvent) => {
      try {
        // Verificar origem da mensagem (domínio pandavideo.com.br)
        if (!event.origin.includes('pandavideo.com.br')) return;
        
        // Tentar processar a mensagem como JSON
        const data = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;
        
        // Se for um evento de player ready e temos startAt
        if (data.event === 'ready' && startAt > 0) {
          playerReadyRef.current = true;
          
          // Esperar um pouco para garantir que o player está pronto
          setTimeout(() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                JSON.stringify({
                  event: 'seek',
                  value: startAt
                }), 
                '*'
              );
            }
          }, 500);
        }
        
        // Se for uma atualização de progresso do vídeo
        if (data.event === 'timeupdate' && data.value && data.value.percent !== undefined) {
          if (onProgress) {
            onProgress(data.value.percent);
          }
          
          // Se o vídeo terminou (progresso de 100%)
          if (onEnded && data.value.percent >= 100) {
            onEnded();
          }
        }
        
        // Evento específico de finalização do vídeo
        if (data.event === 'ended' && onEnded) {
          onEnded();
        }
        
        // Evento de erro no player
        if (data.event === 'error') {
          const errorMessage = data.value?.message || 'Erro desconhecido no player';
          setError(errorMessage);
          if (onError) onError(errorMessage);
        }
      } catch (error) {
        console.error('Erro ao processar mensagem do player:', error);
      }
    };
    
    // Adicionar listener para mensagens do iframe
    window.addEventListener('message', handleMessage);
    
    // Remover listener ao desmontar componente
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [videoId, onProgress, onEnded, startAt, onError]);

  // Construir URL do player com parâmetros
  const buildPlayerUrl = () => {
    let url = `https://player.pandavideo.com.br/embed/?v=${videoId}`;
    if (autoplay) url += '&autoplay=1';
    // Não adicionamos startAt aqui porque vamos usar postMessage para isso
    return url;
  };

  return (
    <div className={`relative w-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar vídeo: {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="aspect-video overflow-hidden rounded-md">
        <iframe
          ref={iframeRef}
          src={buildPlayerUrl()}
          title={title || "Vídeo"}
          className="w-full h-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ 
            border: 'none',
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
          onError={() => {
            setError("Erro ao carregar o player de vídeo");
            if (onError) onError("Erro ao carregar o player de vídeo");
          }}
        />
      </div>
    </div>
  );
};
