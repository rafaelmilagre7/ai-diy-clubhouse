
import React from "react";
import { Video, Youtube } from "lucide-react";

interface VideoThumbnailProps {
  video: {
    metadata?: {
      source?: "youtube" | "upload";
      youtube_id?: string;
      thumbnail_url?: string;
    };
    name: string;
  };
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ video }) => {
  const isYoutube = video.metadata?.source === "youtube";
  const thumbnailUrl = isYoutube 
    ? video.metadata?.thumbnail_url || `https://img.youtube.com/vi/${video.metadata?.youtube_id}/mqdefault.jpg`
    : null;
    
  return (
    <div className="relative aspect-video bg-black rounded-md overflow-hidden">
      {isYoutube && thumbnailUrl ? (
        <img 
          src={thumbnailUrl} 
          alt={video.name} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <Video className="h-10 w-10 text-muted" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/70 rounded-full p-3">
          {isYoutube ? (
            <Youtube className="h-8 w-8 text-red-500" />
          ) : (
            <Video className="h-8 w-8 text-white" />
          )}
        </div>
      </div>
    </div>
  );
};
