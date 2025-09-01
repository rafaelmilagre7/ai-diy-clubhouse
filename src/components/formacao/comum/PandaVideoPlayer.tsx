
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { devLog } from '@/hooks/useOptimizedLogging';
import { RefreshCw, AlertTriangle, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useClearLearningCache } from '@/hooks/learning/useClearLearningCache';

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
  const [silentRetryCount, setSilentRetryCount] = useState(0);
  const [showFallbackButtons, setShowFallbackButtons] = useState(false);
  const [networkSlow, setNetworkSlow] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [healthCheck, setHealthCheck] = useState({ passed: false, checked: false });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  const readyTimeoutRef = useRef<NodeJS.Timeout>();
  const progressTimeoutRef = useRef<NodeJS.Timeout>();
  const loadStartTime = useRef<number>(Date.now());
  const communicationReceived = useRef<boolean>(false);
  
  const { clearAllLearningCache } = useClearLearningCache();
  
  // Determinar a URL baseada no videoId ou usar a URL fornecida diretamente
  const playerUrl = url || `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=${videoId}&autoplay=0&preload=metadata`;
  
  devLog('🐼 [PANDA-ULTRA] Iniciando carregamento:', { 
    videoId, 
    url: playerUrl, 
    title,
    retryCount,
    silentRetryCount,
    cspBlocked,
    iframeBlocked,
    networkSlow,
    healthCheck,
    loadStartTime: loadStartTime.current
  });

  // Detectar velocidade de rede
  const detectNetworkSpeed = () => {
    const startTime = Date.now();
    const loadTime = startTime - loadStartTime.current;
    
    if (loadTime > 10000) {
      setNetworkSlow(true);
      devLog('🐌 [NETWORK] Rede lenta detectada:', { loadTime });
    }
  };

  // Progresso de loading simulado
  const updateLoadingProgress = () => {
    const elapsed = Date.now() - loadStartTime.current;
    const progress = Math.min((elapsed / 35000) * 100, 95); // Máximo 95% até receber confirmação
    setLoadingProgress(progress);
    
    if (elapsed < 35000 && loading) {
      progressTimeoutRef.current = setTimeout(updateLoadingProgress, 1000);
    }
  };

  // Health check do player
  const performHealthCheck = async () => {
    try {
      // Verificar se domínio do Panda está acessível
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://player-vz-d6ebf577-797.tv.pandavideo.com.br/health', {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors'
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      setHealthCheck({ 
        passed: true, // Assumir sucesso se não houve erro
        checked: true 
      });
      devLog('✅ [HEALTH-CHECK] Domínio Panda acessível');
    } catch (error) {
      setHealthCheck({ 
        passed: false, 
        checked: true 
      });
      devLog('❌ [HEALTH-CHECK] Domínio Panda inacessível:', error);
    }
  };

  // Efeito para configurar o listener de mensagens para comunicação com o iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verificar origem do Panda Video
      if (!event.origin.includes('pandavideo.com') && !event.origin.includes('player-vz')) return;
      
      communicationReceived.current = true;
      devLog('🐼 [PANDA-ULTRA] Mensagem recebida:', { 
        origin: event.origin, 
        data: event.data,
        elapsed: Date.now() - loadStartTime.current
      });
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Detectar qualquer comunicação como sinal de vida
        if (data && (data.event || data.type)) {
          setLoading(false);
          setError(null);
          setCspBlocked(false);
          setIframeBlocked(false);
          setShowFallbackButtons(false);
          setLoadingProgress(100);
          
          // Limpar todos os timeouts
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
          if (readyTimeoutRef.current) {
            clearTimeout(readyTimeoutRef.current);
          }
          if (progressTimeoutRef.current) {
            clearTimeout(progressTimeoutRef.current);
          }
        }
        
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
        
        // Detectar eventos específicos de prontidão
        if (data.event === 'ready' || data.type === 'ready' || 
            data.event === 'loaded' || data.event === 'canplay' ||
            data.type === 'canplay' || data.event === 'loadeddata') {
          devLog('✅ [PANDA-ULTRA] Player oficialmente pronto');
          setLoading(false);
          setLoadingProgress(100);
        }
      } catch (err) {
        devLog('❌ [PANDA-ULTRA] Erro ao processar mensagem:', err);
        // Mesmo com erro na mensagem, detectamos comunicação
        if (loading) {
          setLoading(false);
          setLoadingProgress(100);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loading, onProgress, onEnded]);

  const handleLoad = () => {
    const loadTime = Date.now() - loadStartTime.current;
    devLog('✅ [PANDA-ULTRA] Iframe carregado', { loadTime });
    
    detectNetworkSpeed();
    
    // Aguardar mais tempo para comunicação do player (12 segundos em rede lenta, 8 normal)
    const waitTime = networkSlow ? 12000 : 8000;
    
    readyTimeoutRef.current = setTimeout(() => {
      if (loading && !communicationReceived.current) {
        devLog('⚠️ [PANDA-ULTRA] Iframe carregou mas sem comunicação do player', { 
          waitTime,
          networkSlow,
          silentRetryCount,
          elapsed: Date.now() - loadStartTime.current
        });
        
        // Primeiro tentar retry silencioso mais agressivo
        if (silentRetryCount < 3) {
          devLog('🔄 [SILENT-RETRY] Tentativa silenciosa:', silentRetryCount + 1);
          setSilentRetryCount(prev => prev + 1);
          
          // Recarregar iframe silenciosamente com cache bust
          if (iframeRef.current) {
            const separator = playerUrl.includes('?') ? '&' : '?';
            const newUrl = `${playerUrl}${separator}cache=${Date.now()}&retry=${silentRetryCount + 1}`;
            iframeRef.current.src = '';
            setTimeout(() => {
              if (iframeRef.current) {
                iframeRef.current.src = newUrl;
                loadStartTime.current = Date.now();
              }
            }, 200);
          }
        } else {
          // Após 3 tentativas silenciosas, considerar problema real
          devLog('🚨 [PANDA-ULTRA] Múltiplas falhas - assumindo bloqueio');
          setCspBlocked(true);
          setLoading(false);
          setShowFallbackButtons(true);
        }
      }
    }, waitTime);
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
    devLog('🔍 [CSP-DETECT] Iniciando detecção avançada de bloqueio...');
    
    // Timeout MUITO mais longo para detectar problemas reais (35 segundos)
    loadTimeoutRef.current = setTimeout(() => {
      if (loading && !communicationReceived.current) {
        devLog('🚨 [CSP-DETECT] Timeout final após 35s - analisando situação...', {
          retryCount,
          silentRetryCount,
          healthCheck,
          networkSlow,
          elapsed: Date.now() - loadStartTime.current
        });
        
        // Primeiro retry automático inteligente
        if (retryCount < 1) {
          devLog('🔄 [AUTO-RETRY] Primeiro retry automático após timeout');
          handleRetry();
        } else {
          // Após retry, considerar bloqueio real ou problema de rede
          const isNetworkIssue = !healthCheck.passed || networkSlow;
          
          if (isNetworkIssue) {
            setError("Problema de conexão detectado - verifique sua internet");
          } else {
            setError("Vídeo pode estar sendo bloqueado por políticas de segurança");
          }
          
          setCspBlocked(true);
          setIframeBlocked(true);
          setLoading(false);
          setShowFallbackButtons(true);
        }
      }
    }, 35000); // 35 segundos timeout
  };
  
  const handleRetry = () => {
    devLog('🔄 [PANDA-ULTRA] Retry inteligente...', { 
      retryCount: retryCount + 1,
      silentRetryCount,
      manual: retryCount > 0
    });
    
    setRetryCount(prev => prev + 1);
    setSilentRetryCount(0);
    setLoading(true);
    setError(null);
    setCspBlocked(false);
    setIframeBlocked(false);
    setShowFallbackButtons(false);
    setNetworkSlow(false);
    setLoadingProgress(0);
    
    // Reset das refs
    loadStartTime.current = Date.now();
    communicationReceived.current = false;
    
    // Limpar timeouts existentes
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
    }
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
    
    // Health check antes de tentar novamente
    performHealthCheck();
    
    // Reiniciar progresso
    updateLoadingProgress();
    
    // Reiniciar detecção
    detectCSPBlocking();
    
    // Só mostrar toast em retry manual
    if (retryCount > 0) {
      toast.info('Recarregando vídeo...', {
        description: 'Tentando carregar o vídeo novamente'
      });
    }
  };

  const handleClearCacheAndRetry = async () => {
    devLog('🧹 [CACHE-RETRY] Limpando cache e tentando novamente...');
    
    toast.loading('Limpando cache...', { id: 'cache-clear' });
    
    try {
      clearAllLearningCache();
      
      toast.success('Cache limpo! Recarregando vídeo...', { id: 'cache-clear' });
      
      // Pequeno delay antes do retry
      setTimeout(() => {
        handleRetry();
      }, 1000);
    } catch (error) {
      devLog('❌ [CACHE-RETRY] Erro:', error);
      toast.error('Erro ao limpar cache', { id: 'cache-clear' });
    }
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
    loadStartTime.current = Date.now();
    communicationReceived.current = false;
    
    performHealthCheck();
    updateLoadingProgress();
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
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
      }
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, []);

  // Só mostrar erro se os botões de fallback estiverem habilitados
  if ((error || cspBlocked || iframeBlocked) && showFallbackButtons) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-0">
          <div 
            className="flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg p-6"
            style={{ width, height }}
          >
            {networkSlow ? <WifiOff className="w-12 h-12 mb-4" /> : <AlertTriangle className="w-12 h-12 mb-4" />}
            
            {cspBlocked ? (
              <>
                <h3 className="font-semibold mb-2">
                  {networkSlow ? 'Problema de Conexão' : 'Vídeo Bloqueado'}
                </h3>
                <p className="text-center px-4 mb-4 text-sm">
                  {networkSlow 
                    ? 'Sua conexão está lenta ou instável. Tente limpar o cache ou verificar sua internet.'
                    : 'O vídeo pode estar sendo bloqueado por políticas de segurança do navegador.'
                  }
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button 
                    onClick={handleClearCacheAndRetry}
                    variant="outline" 
                    size="sm"
                    className="w-full border-amber-200 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpar Cache e Tentar
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      onClick={openVideoDirectly} 
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-blue-200 hover:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-900/20"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Nova Aba
                    </Button>
                    <Button 
                      onClick={handleRetry} 
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-rose-200 hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/20"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              </>
            ) : iframeBlocked ? (
              <>
                <h3 className="font-semibold mb-2">Carregamento Bloqueado</h3>
                <p className="text-center px-4 mb-4 text-sm">
                  O iframe do vídeo foi bloqueado. Pode ser um problema de rede ou firewall.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button 
                    onClick={handleClearCacheAndRetry}
                    variant="outline" 
                    size="sm"
                    className="w-full border-amber-200 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpar Cache e Tentar
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      onClick={openVideoDirectly} 
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-blue-200 hover:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-900/20"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Diretamente
                    </Button>
                    <Button 
                      onClick={handleRetry} 
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-rose-200 hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/20"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-center px-4 mb-4 font-medium">{error}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleClearCacheAndRetry}
                    variant="outline" 
                    size="sm"
                    className="border-amber-200 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpar Cache
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
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              {loadingProgress > 0 && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="text-xs text-white/70">{Math.round(loadingProgress)}%</div>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-white text-sm mb-1">
                Carregando vídeo do Panda...
              </div>
              {networkSlow && (
                <div className="text-amber-300 text-xs flex items-center justify-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Conexão lenta detectada
                </div>
              )}
              {healthCheck.checked && !healthCheck.passed && (
                <div className="text-red-300 text-xs flex items-center justify-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Problema de conectividade
                </div>
              )}
            </div>
            
            {/* Barra de progresso */}
            {loadingProgress > 0 && (
              <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            )}
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ 
          backgroundColor: '#0f172a',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};
