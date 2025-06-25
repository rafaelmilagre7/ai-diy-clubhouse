
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, ExternalLink } from "lucide-react";
import { SolutionVideo } from "@/hooks/useSolutionVideos";

interface VideoItemProps {
  video: SolutionVideo;
}

export const VideoItem = ({ video }: VideoItemProps) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVideoTypeLabel = (type: string) => {
    switch (type) {
      case 'youtube':
        return 'YouTube';
      case 'vimeo':
        return 'Vimeo';
      case 'direct':
        return 'Vídeo Direto';
      default:
        return type;
    }
  };

  const handlePlayVideo = () => {
    window.open(video.video_url, "_blank");
  };

  const getThumbnail = () => {
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    
    // Gerar thumbnail para YouTube
    if (video.video_type === 'youtube' && video.video_url.includes('youtube.com')) {
      const videoId = video.video_url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    return null;
  };

  const thumbnail = getThumbnail();

  return (
    <Card className="bg-[#151823] border border-white/5 hover:border-white/10 transition-colors">
      <CardContent className="p-0">
        {/* Thumbnail/Preview */}
        <div className="relative aspect-video bg-neutral-800 rounded-t-lg overflow-hidden">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-12 w-12 text-neutral-600" />
            </div>
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer group" onClick={handlePlayVideo}>
            <div className="bg-viverblue/90 hover:bg-viverblue text-white rounded-full p-4 group-hover:scale-110 transition-transform">
              <Play className="h-6 w-6" />
            </div>
          </div>
          
          {/* Duration badge */}
          {video.duration_seconds && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(video.duration_seconds)}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-neutral-100 line-clamp-2">
              {video.title}
            </h4>
            <Badge 
              variant="outline" 
              className="bg-neutral-800 text-neutral-300 border-neutral-700 text-xs shrink-0"
            >
              {getVideoTypeLabel(video.video_type)}
            </Badge>
          </div>
          
          {video.description && (
            <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
              {video.description}
            </p>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayVideo}
            className="w-full bg-transparent border-viverblue/20 text-viverblue hover:bg-viverblue/10"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Assistir Vídeo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
