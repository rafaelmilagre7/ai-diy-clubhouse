
import React from "react";

interface YoutubeEmbedProps {
  youtubeId: string;
  title?: string;
}

export const YoutubeEmbed: React.FC<YoutubeEmbedProps> = ({ youtubeId, title }) => {
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
  
  return (
    <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden">
      <iframe 
        src={embedUrl} 
        title={title || "YouTube video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-56 md:h-72"
      />
    </div>
  );
};
