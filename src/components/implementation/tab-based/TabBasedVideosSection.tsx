
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock } from "lucide-react";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";

interface TabBasedVideosSectionProps {
  solutionId: string;
  videos: any[];
}

export const TabBasedVideosSection = ({ solutionId, videos }: TabBasedVideosSectionProps) => {
  if (videos.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Vídeos Explicativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum vídeo disponível</h3>
              <p className="text-muted-foreground">
                Esta solução não possui vídeos explicativos no momento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Vídeos Explicativos
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Assista aos vídeos para entender melhor como implementar esta solução
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {videos.map((video, index) => (
          <Card key={video.id || index} className="border-white/10">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">
                    {video.title || video.name || `Vídeo ${index + 1}`}
                  </h3>
                  {video.description && (
                    <p className="text-muted-foreground mb-4">
                      {video.description}
                    </p>
                  )}
                  
                  {video.duration_seconds && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}</span>
                    </div>
                  )}
                </div>
                
                <div className="aspect-video">
                  <YoutubeEmbed 
                    url={video.url} 
                    title={video.title || video.name || `Vídeo ${index + 1}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
