
import React from "react";
import { YoutubeBlockData } from "@/components/admin/solution/editor/BlockTypes";

interface YoutubeBlockProps {
  data: YoutubeBlockData;
  onVideoInteraction?: () => void;
}

export const YoutubeBlock: React.FC<YoutubeBlockProps> = ({ data, onVideoInteraction }) => {
  const { youtubeId, caption } = data;
  
  if (!youtubeId) {
    return null;
  }
  
  const handleVideoInteraction = () => {
    if (onVideoInteraction) {
      onVideoInteraction();
    }
  };
  
  return (
    <figure className="my-6">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe 
          src={`https://www.youtube.com/embed/${youtubeId}`} 
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
          title={caption || "Vídeo do YouTube"}
          onClick={handleVideoInteraction}
          onPlay={handleVideoInteraction}
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-center text-gray-500 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
