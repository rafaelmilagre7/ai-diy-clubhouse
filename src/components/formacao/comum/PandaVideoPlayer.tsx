
import React, { useEffect } from "react";

interface PandaVideoPlayerProps {
  videoId: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({ videoId, title, onProgress, onEnded }) => {
  // Construir URL do iframe para o Panda Video
  const embedUrl = `https://player.pandavideo.com.br/embed/?v=${videoId}`;
  
  // Implementar comunicação com o iframe do Panda Video
  useEffect(() => {
    // Objeto para armazenar o último progresso reportado
    // Isso evita callbacks excessivos quando o progresso não muda significativamente
    const lastReportedProgress = { value: 0 };
    
    // Função que trata mensagens do iframe do Panda Video
    const handlePandaMessage = (event: MessageEvent) => {
      // Verificar origem da mensagem (deve ser do domínio pandavideo.com.br)
      if (!event.origin.includes('pandavideo.com.br')) return;
      
      try {
        // Tentar parsear a mensagem como JSON
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Processar eventos do player
        if (data.event === 'timeupdate' && onProgress) {
          // Calcular porcentagem de progresso
          const progress = Math.round((data.currentTime / data.duration) * 100);
          
          // Reportar somente mudanças significativas (de 5 em 5%)
          if (progress % 5 === 0 && progress !== lastReportedProgress.value) {
            lastReportedProgress.value = progress;
            onProgress(progress);
          }
        }
        
        // Detectar fim do vídeo
        if (data.event === 'ended' && onEnded) {
          onEnded();
        }
      } catch (error) {
        // Ignore erros de parsing de JSON (mensagens não relacionadas)
        console.debug("Erro ao processar mensagem do Panda Video:", error);
      }
    };
    
    // Registrar handler de mensagem
    window.addEventListener('message', handlePandaMessage);
    
    // Limpar event listener quando o componente for desmontado
    return () => {
      window.removeEventListener('message', handlePandaMessage);
    };
  }, [onProgress, onEnded]);
  
  return (
    <div className="aspect-video rounded-md overflow-hidden">
      <iframe
        src={embedUrl}
        title={title || "Vídeo"}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
};
