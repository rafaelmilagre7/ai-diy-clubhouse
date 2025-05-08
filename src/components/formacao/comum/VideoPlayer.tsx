
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
  // Extrair ID do vídeo Panda da URL, se aplicável
  const extractPandaVideoId = (url: string): string | null => {
    // Padrão de URL do Panda: https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=VIDEO_ID
    const match = url.match(/embed\/\?v=([^&]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Outro padrão comum
    const altMatch = url.match(/\/embed\/([^/?]+)/);
    if (altMatch && altMatch[1]) {
      return altMatch[1];
    }
    
    return null;
  };

  // Extrair ID de vídeo do YouTube
  const extractYoutubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Renderizar com base no tipo de vídeo
  if (videoType === 'panda' || videoUrl.includes('pandavideo')) {
    const videoId = extractPandaVideoId(videoUrl) || '';
    return <PandaVideoPlayer videoId={videoId} url={videoUrl} title="Vídeo da aula" />;
  } 
  
  // Vídeo do YouTube
  else if (videoType === 'youtube' || videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) {
    const youtubeId = extractYoutubeVideoId(videoUrl);
    if (youtubeId) {
      return (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="Vídeo do YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
  }
  
  // Vídeo direto (arquivo)
  return (
    <div className="aspect-video">
      <video 
        src={videoUrl} 
        controls 
        poster={thumbnailUrl} 
        className="w-full h-full"
        preload="metadata"
      >
        Seu navegador não suporta a tag de vídeo.
      </video>
    </div>
  );
};

export default VideoPlayer;
