import { useEffect, useRef, useState } from 'react';
import { devLog } from '@/hooks/useOptimizedLogging';

interface PandaVideoScriptPlayerProps {
  videoId: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  onError?: () => void;
  timeout?: number;
}

export const PandaVideoScriptPlayer: React.FC<PandaVideoScriptPlayerProps> = ({
  videoId,
  title,
  onProgress,
  onEnded,
  onError,
  timeout = 30000
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Carregar script da API do PandaVideo
  useEffect(() => {
    const scriptId = 'panda-api-script';
    
    // Verificar se o script já existe
    if (document.getElementById(scriptId)) {
      setScriptLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/api.v1.js';
    script.async = true;
    
    script.onload = () => {
      setScriptLoaded(true);
    };
    
    script.onerror = () => {
      setErrorState(true);
      setLoading(false);
      onError?.();
    };
    
    document.body.appendChild(script);
    
    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      if (!scriptLoaded) {
        setErrorState(true);
        setLoading(false);
        onError?.();
      }
    }, timeout);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Inicializar player quando script carregar
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || playerRef.current) return;
    
    const containerId = `panda-${videoId}`;
    
    try {
      // Garantir que pandascripttag existe
      (window as any).pandascripttag = (window as any).pandascripttag || [];
      
      // Inicializar player
      (window as any).pandascripttag.push(function() {
        try {
          const PandaPlayer = (window as any).PandaPlayer;
          
          if (!PandaPlayer) {
            setErrorState(true);
            setLoading(false);
            onError?.();
            return;
          }
          
          const player = new PandaPlayer(containerId, {
            onReady: () => {
              setLoading(false);
              playerRef.current = player;
              
              // Iniciar monitoramento de progresso
              progressIntervalRef.current = setInterval(() => {
                if (playerRef.current) {
                  try {
                    playerRef.current.getCurrentTime((currentTime: number) => {
                      playerRef.current.getDuration((duration: number) => {
                        if (duration > 0) {
                          const progress = (currentTime / duration) * 100;
                          onProgress?.(progress);
                        }
                      });
                    });
                  } catch (error) {
                    // Silencioso
                  }
                }
              }, 5000);
            },
            onError: () => {
              setErrorState(true);
              setLoading(false);
              onError?.();
            }
          });
          
          // Escutar eventos do player
          if (player.onEvent) {
            player.onEvent((event: any) => {
              if (event.message === 'panda_timeupdate') {
                const progress = (event.currentTime / event.duration) * 100;
                onProgress?.(progress);
              }
              
              if (event.message === 'panda_ended') {
                onEnded?.();
              }
            });
          }
        } catch (error) {
          setErrorState(true);
          setLoading(false);
          onError?.();
        }
      });
      
    } catch (error) {
      setErrorState(true);
      setLoading(false);
      onError?.();
    }
    
    return () => {
      // Cleanup
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current = null;
      }
    };
  }, [scriptLoaded, videoId]);
  
  if (errorState) {
    return (
      <div className="relative w-full aspect-video bg-status-error/10 rounded-lg flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-status-error font-medium">Erro ao carregar vídeo</p>
          <p className="text-sm text-muted-foreground mt-2">
            Não foi possível inicializar o player do PandaVideo
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full aspect-video">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Carregando vídeo...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef}
        id={`panda-${videoId}`}
        className="w-full h-full rounded-lg overflow-hidden bg-black"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};
