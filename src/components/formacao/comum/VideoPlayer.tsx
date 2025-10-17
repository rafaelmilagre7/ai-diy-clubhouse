
import React from 'react';
import { PandaVideoPlayer } from './PandaVideoPlayer';

interface VideoPlayerProps {
  videoUrl: string;
  videoType?: string;
  thumbnailUrl?: string;
}

/**
 * Componente adaptador de VideoPlayer que aceita props simples e utiliza o PandaVideoPlayer
 * para renderizar vídeos do Panda, ou outros players conforme o tipo.
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  videoType = 'youtube',
  thumbnailUrl 
}) => {
  // Log para debugging
  console.log("VideoPlayer recebeu:", { videoUrl, videoType, thumbnailUrl });
  
  // Extrair ID do vídeo Panda da URL, se aplicável
  const extractPandaVideoId = (url: string): string | null => {
    // Verificar se a URL é válida
    if (!url) return null;
    
    try {
      // Padrão de URL do Panda: https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=VIDEO_ID
      const match = url.match(/embed\/\?v=([^&]+)/);
      if (match && match[1]) {
        console.log("ID de vídeo Panda extraído (padrão 1):", match[1]);
        return match[1];
      }
      
      // Outro padrão comum
      const altMatch = url.match(/\/embed\/([^/?]+)/);
      if (altMatch && altMatch[1]) {
        console.log("ID de vídeo Panda extraído (padrão 2):", altMatch[1]);
        return altMatch[1];
      }
      
      // Verificar se o ID do vídeo pode estar diretamente na URL
      const directIdMatch = url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      if (directIdMatch && directIdMatch[1]) {
        console.log("ID de vídeo Panda extraído (diretamente):", directIdMatch[1]);
        return directIdMatch[1];
      }
      
      console.log("Não foi possível extrair ID do vídeo Panda da URL:", url);
      return null;
    } catch (error) {
      console.error("Erro ao processar URL do vídeo Panda:", error);
      return null;
    }
  };

  // Extrair ID de vídeo do YouTube
  const extractYoutubeVideoId = (url: string): string | null => {
    // Verificar se a URL é válida
    if (!url) return null;
    
    try {
      // Verificar se já é um ID direto (sem URL)
      if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
        return url;
      }
      
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = url.match(regex);
      
      if (match && match[1]) {
        console.log("ID de vídeo YouTube extraído:", match[1]);
        return match[1];
      }
      
      console.log("Não foi possível extrair ID do vídeo YouTube da URL:", url);
      return null;
    } catch (error) {
      console.error("Erro ao processar URL do vídeo YouTube:", error);
      return null;
    }
  };

  // Determina o tipo de vídeo automaticamente se não especificado
  const determineVideoType = (url: string): string => {
    if (!url) return 'unknown';
    if (url.includes('pandavideo')) return 'panda';
    if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
    if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return 'video';
    return 'unknown';
  };
  
  // Se o tipo não for explicitamente especificado, determinar automaticamente
  const effectiveVideoType = videoType === 'auto' ? determineVideoType(videoUrl) : videoType;
  
  // Renderizar com base no tipo de vídeo
  if (effectiveVideoType === 'panda' || (videoUrl && videoUrl.includes('pandavideo'))) {
    const videoId = extractPandaVideoId(videoUrl) || '';
    if (!videoId) {
      console.warn("ID de vídeo Panda não pôde ser extraído:", videoUrl);
      return (
        <div className="aspect-video bg-muted flex items-center justify-center rounded-md">
          <p className="text-muted-foreground text-sm">Erro ao processar vídeo Panda. URL inválida.</p>
        </div>
      );
    }
    return <PandaVideoPlayer videoId={videoId} url={videoUrl} title="Vídeo da aula" />;
  } 
  
  // Vídeo do YouTube
  else if (effectiveVideoType === 'youtube' || (videoUrl && (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')))) {
    const youtubeId = extractYoutubeVideoId(videoUrl);
    if (youtubeId) {
      return (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="Vídeo do YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-md"
          />
        </div>
      );
    } else {
      console.warn("ID de vídeo YouTube não pôde ser extraído:", videoUrl);
      return (
        <div className="aspect-video bg-muted flex items-center justify-center rounded-md">
          <p className="text-muted-foreground text-sm">Erro ao processar vídeo do YouTube. URL inválida.</p>
        </div>
      );
    }
  }
  
  // Vídeo direto (arquivo)
  if (!videoUrl) {
    return (
      <div className="aspect-video bg-muted flex items-center justify-center rounded-md">
        <p className="text-muted-foreground text-sm">Nenhuma URL de vídeo fornecida.</p>
      </div>
    );
  }
  
  return (
    <div className="aspect-video">
      <video 
        src={videoUrl} 
        controls 
        poster={thumbnailUrl} 
        className="w-full h-full rounded-md"
        preload="metadata"
      >
        Seu navegador não suporta a tag de vídeo.
      </video>
    </div>
  );
};

export default VideoPlayer;
