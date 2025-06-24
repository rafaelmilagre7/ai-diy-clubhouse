
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock } from "lucide-react";
import { SolutionVideo } from "@/hooks/useSolutionVideos";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";

interface VideoItemProps {
  video: SolutionVideo;
}

export const VideoItem = ({ video }: VideoItemProps) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Duração não informada";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getYouTubeId = (url: string): string | null => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (error) {
      return null;
    }
  };

  const youtubeId = video.video_type === "youtube" ? getYouTubeId(video.url) : null;

  return (
    <Card className="bg-[#151823] border border-white/5">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Video Player */}
          <div className="aspect-video rounded-lg overflow-hidden bg-neutral-900">
            {youtubeId ? (
              <YoutubeEmbed youtubeId={youtubeId} title={video.title} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-500 text-sm">Vídeo não disponível</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Video Info */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-neutral-100 line-clamp-2">
                {video.title}
              </h4>
              <Badge variant="outline" className="bg-neutral-800 text-neutral-300 border-neutral-700 text-xs">
                {video.video_type}
              </Badge>
            </div>
            
            {video.description && (
              <p className="text-sm text-neutral-400 mb-3 line-clamp-3">
                {video.description}
              </p>
            )}
            
            {video.duration_seconds && (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(video.duration_seconds)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
