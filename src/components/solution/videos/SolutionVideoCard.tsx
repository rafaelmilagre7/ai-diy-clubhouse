
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink } from "lucide-react";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";

interface SolutionVideoCardProps {
  video: any;
}

export const SolutionVideoCard = ({ video }: SolutionVideoCardProps) => {
  const getYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/v\/)([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    return null;
  };

  const isYoutubeVideo = video.type === 'youtube' || video.url?.includes('youtube.com') || video.url?.includes('youtu.be');
  const youtubeId = isYoutubeVideo ? getYoutubeId(video.url) : null;

  return (
    <Card className="border-white/10 bg-backgroundLight">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-textPrimary mb-2">
              {video.name}
            </h4>
            {video.description && (
              <p className="text-sm text-textSecondary">
                {video.description}
              </p>
            )}
          </div>

          {isYoutubeVideo && youtubeId ? (
            <div className="aspect-video overflow-hidden rounded-lg">
              <YoutubeEmbed youtubeId={youtubeId} title={video.name} />
            </div>
          ) : video.type === 'video' ? (
            <div className="aspect-video overflow-hidden rounded-lg bg-backgroundDark border border-white/10 flex items-center justify-center">
              <Button
                onClick={() => window.open(video.url, '_blank')}
                variant="outline"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Assistir Vídeo
              </Button>
            </div>
          ) : (
            <div className="aspect-video overflow-hidden rounded-lg bg-backgroundDark border border-white/10 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Play className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Formato de vídeo não suportado
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(video.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Link
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
