
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SolutionVideoCardProps {
  video: {
    id: string;
    title: string;
    description?: string;
    url: string;
    thumbnail_url?: string;
    type: string;
    duration?: number;
  };
}

export const SolutionVideoCard = ({ video }: SolutionVideoCardProps) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleWatchVideo = () => {
    if (video.url) {
      window.open(video.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getThumbnail = () => {
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    
    // Para vídeos do YouTube, extrair thumbnail da URL
    if (video.type === 'youtube' && video.url) {
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
      const match = video.url.match(youtubeRegex);
      if (match) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
    
    return null;
  };

  const thumbnail = getThumbnail();

  return (
    <Card className="border-white/10 hover:border-viverblue/30 transition-colors group">
      <div className="relative">
        {thumbnail ? (
          <div className="relative aspect-video rounded-t-lg overflow-hidden">
            <img 
              src={thumbnail} 
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatDuration(video.duration)}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center">
            <PlayCircle className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight">{video.title}</CardTitle>
        {video.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {video.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <Button 
          onClick={handleWatchVideo}
          className="w-full bg-viverblue hover:bg-viverblue-dark"
          disabled={!video.url}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Assistir Vídeo
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
