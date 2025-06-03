
import React from "react";

interface YoutubeEmbedProps {
  youtubeId?: string;
  url?: string;
  title?: string;
  className?: string;
}

export const YoutubeEmbed: React.FC<YoutubeEmbedProps> = ({ youtubeId, url, title, className }) => {
  // Função para extrair ID do YouTube da URL
  const extractYoutubeId = (videoUrl: string): string => {
    if (!videoUrl) return '';
    
    // Diversos formatos de URL do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    // Se não encontrar padrão, assumir que já é um ID
    return videoUrl;
  };

  // Usar youtubeId diretamente ou extrair da URL
  const videoId = youtubeId || (url ? extractYoutubeId(url) : '');
  
  if (!videoId) {
    return (
      <div className={`aspect-video rounded-md bg-muted flex items-center justify-center ${className || ''}`}>
        <p className="text-muted-foreground">Vídeo não disponível</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  return (
    <div className={`aspect-video rounded-md overflow-hidden shadow-sm ${className || ''}`}>
      <iframe 
        src={embedUrl}
        title={title || "YouTube video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        loading="lazy"
      />
    </div>
  );
};
