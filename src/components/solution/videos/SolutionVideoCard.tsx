
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink } from "lucide-react";

interface SolutionVideoCardProps {
  video: any;
}

export const SolutionVideoCard = ({ video }: SolutionVideoCardProps) => {
  const handlePlayVideo = () => {
    if (video.url) {
      window.open(video.url, '_blank');
    }
  };

  const getThumbnail = () => {
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    
    // Para vídeos do YouTube, extrair thumbnail
    if (video.type === 'youtube' && video.url) {
      const videoId = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    return null;
  };

  return (
    <Card className="border-white/10 bg-backgroundLight hover:bg-backgroundLight/80 transition-colors">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-textPrimary mb-2">
              {video.name || video.title}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-1 rounded bg-red-900/40 text-red-200 border border-red-700/30">
                {video.type === 'youtube' ? 'YouTube' : 'Vídeo'}
              </span>
              {video.duration_seconds && (
                <span className="text-xs text-textSecondary">
                  {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
          </div>
          
          <div className="relative aspect-video bg-neutral-800 rounded-lg overflow-hidden">
            {getThumbnail() ? (
              <img 
                src={getThumbnail()!} 
                alt={video.name || video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="h-12 w-12 text-neutral-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayVideo}
            className="w-full"
            disabled={!video.url}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Assistir Vídeo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
