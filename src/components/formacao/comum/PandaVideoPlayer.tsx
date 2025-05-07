
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  onProgress?: (progress: number) => void;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  title,
  autoplay = false,
  onProgress
}) => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simular carregamento para evitar flash de conteúdo
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [videoId]);
  
  // Configurar comunicação com o player do Panda Video
  useEffect(() => {
    if (!onProgress) return;
    
    // Função para receber mensagens do iframe
    const handleMessage = (event: MessageEvent) => {
      try {
        // Verificar origem da mensagem (domínio pandavideo.com.br)
        if (!event.origin.includes('pandavideo.com.br')) return;
        
        // Tentar processar a mensagem como JSON
        const data = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;
        
        // Se for uma atualização de progresso do vídeo
        if (data.event === 'timeupdate' && data.value && data.value.percent !== undefined) {
          onProgress(data.value.percent);
        }
      } catch (error) {
        console.log('Erro ao processar mensagem do player:', error);
      }
    };
    
    // Adicionar listener para mensagens do iframe
    window.addEventListener('message', handleMessage);
    
    // Remover listener ao desmontar componente
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [videoId, onProgress]);

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      <div className="aspect-video overflow-hidden rounded-md">
        <iframe
          src={`https://player.pandavideo.com.br/embed/?v=${videoId}${autoplay ? '&autoplay=1' : ''}`}
          title={title || "Vídeo"}
          className="w-full h-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ 
            border: 'none',
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};
