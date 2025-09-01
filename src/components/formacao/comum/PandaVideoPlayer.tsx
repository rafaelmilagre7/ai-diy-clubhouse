
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { devLog } from '@/hooks/useOptimizedLogging';
import { RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PandaVideoPlayerProps {
  videoId: string;
  url?: string;
  title?: string;
  width?: string;
  height?: string;
  className?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  url,
  title = "Vídeo",
  width = "100%",
  height = "100%",
  className,
  onProgress,
  onEnded
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cspBlocked, setCspBlocked] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Determinar a URL baseada no videoId ou usar a URL fornecida diretamente
  const playerUrl = url || `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=${videoId}`;
  
  devLog('🐼 [PANDA-ENHANCED] Iniciando carregamento:', { 
    videoId, 
    url: playerUrl, 
    title,
    retryCount,
    cspBlocked,
    iframeBlocked 
  });

  // Efeito para configurar o listener de mensagens para comunicação com o iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verificar origem do Panda Video
      if (!event.origin.includes('pandavideo.com')) return;
      
      devLog('🐼 [PANDA-ENHANCED] Mensagem recebida:', event.data);
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Lidar com progresso do vídeo
        if ((data.event === 'progress' || data.type === 'progress') && onProgress) {
          const progress = data.percent || data.progress || 0;
          // Converter para progresso binário: >= 95% é considerado concluído
          const binaryProgress = progress >= 95 ? 100 : 0;
          onProgress(binaryProgress);
          devLog(`🐼 [PROGRESS] ${progress}% (binário: ${binaryProgress}%)`);
        }
        
        // Lidar com fim do vídeo
        if ((data.event === 'ended' || data.type === 'ended') && onEnded) {
          onEnded();
          devLog('🐼 [ENDED] Vídeo finalizado');
        }
        
        // Detectar se o iframe carregou com sucesso
        if (data.event === 'ready' || data.type === 'ready' || data.event === 'loaded') {
          devLog('✅ [PANDA-ENHANCED] Player pronto');
          setLoading(false);
          setError(null);
          setCspBlocked(false);
          setIframeBlocked(false);
        }
      } catch (err) {
        devLog('❌ [PANDA-ENHANCED] Erro ao processar mensagem:', err);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgress, onEnded]);

  const handleLoad = () => {
    devLog('✅ [PANDA-ENHANCED] Iframe carregado');
    
    // Limpar timeout de detecção
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    // Aguardar um pouco para ver se recebemos mensagens do player
    setTimeout(() => {
      if (loading) {
        devLog('⚠️ [PANDA-ENHANCED] Iframe carregou mas sem comunicação - possível CSP');
        setCspBlocked(true);
        setLoading(false);
      }
    }, 3000);
  };

  const handleError = (event: any) => {
    devLog('❌ [PANDA-ENHANCED] Erro direto no iframe:', { 
      playerUrl, 
      videoId, 
      error: event 
    });
    
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    setLoading(false);
    setIframeBlocked(true);
    setError("Iframe bloqueado - pode ser um problema de CSP ou firewall");
  };
  
  const detectCSPBlocking = () => {
    devLog('🔍 [CSP-DETECT] Iniciando detecção de bloqueio...');
    
    // Timeout para detectar se o iframe não consegue se comunicar
    loadTimeoutRef.current = setTimeout(() => {
      if (loading) {
        devLog('🚨 [CSP-DETECT] Timeout - possível bloqueio de CSP detectado');
        setCspBlocked(true);
        setIframeBlocked(true);
        setLoading(false);
        setError("Vídeo pode estar sendo bloqueado por políticas de segurança");
      }
    }, 10000); // 10 segundos timeout
  };
  
  const handleRetry = () => {
    devLog('🔄 [PANDA-ENHANCED] Tentando novamente...', { retryCount: retryCount + 1 });
    
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(null);
    setCspBlocked(false);
    setIframeBlocked(false);
    
    // Reiniciar detecção
    detectCSPBlocking();
    
    toast.info('Recarregando vídeo...', {
      description: 'Tentando carregar o vídeo novamente'
    });
  };
  
  const openVideoDirectly = () => {
    devLog('🔗 [EXTERNAL] Abrindo vídeo em nova aba');
    window.open(playerUrl, '_blank', 'noopener,noreferrer');
    
    toast.info('Vídeo aberto', {
      description: 'Vídeo foi aberto em uma nova aba'
    });
  };
  
  // Iniciar detecção quando componente monta
  useEffect(() => {
    detectCSPBlocking();
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [playerUrl]);
  
  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  if (error || cspBlocked || iframeBlocked) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-0">
          <div 
            className="flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg"
            style={{ width, height }}
          >
            <AlertTriangle className="w-12 h-12 mb-4" />
            
            {cspBlocked ? (
              <>
                <h3 className="font-semibold mb-2">Vídeo Bloqueado</h3>
                <p className="text-center px-4 mb-4 text-sm">
                  O vídeo foi bloqueado por políticas de segurança do navegador. 
                  Tente abrir em uma nova aba ou desabilite bloqueadores.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={openVideoDirectly} 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 hover:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-900/20"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir em Nova Aba
                  </Button>
                  <Button 
                    onClick={handleRetry} 
                    variant="outline" 
                    size="sm"
                    className="border-rose-200 hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </>
            ) : iframeBlocked ? (
              <>
                <h3 className="font-semibold mb-2">Carregamento Bloqueado</h3>
                <p className="text-center px-4 mb-4 text-sm">
                  O iframe do vídeo foi bloqueado. Pode ser um problema de rede ou firewall.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={openVideoDirectly} 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 hover:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-900/20"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Vídeo Diretamente
                  </Button>
                  <Button 
                    onClick={handleRetry} 
                    variant="outline" 
                    size="sm"
                    className="border-rose-200 hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry ({retryCount}/3)
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-center px-4 mb-4 font-medium">{error}</p>
                <Button 
                  onClick={handleRetry} 
                  variant="outline" 
                  size="sm"
                  className="border-rose-200 hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative w-full aspect-video ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-md z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <div className="text-white text-sm">Carregando vídeo do Panda...</div>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={playerUrl}
        title={title}
        width={width}
        height={height}
        loading="eager"
        className="w-full h-full rounded-md"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          backgroundColor: '#0f172a',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};
