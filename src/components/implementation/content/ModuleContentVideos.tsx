
import React from "react";
import { Module } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock, Video } from "lucide-react";

interface ModuleContentVideosProps {
  module: Module;
}

// Helper function to safely parse JSON content
const parseVideos = (content: any): any[] => {
  if (!content) return [];
  
  // If it's already an array
  if (Array.isArray(content)) {
    return content;
  }
  
  // If it's an object with videos property
  if (typeof content === 'object' && content.videos) {
    return Array.isArray(content.videos) ? content.videos : [];
  }
  
  return [];
};

export const ModuleContentVideos = ({ module }: ModuleContentVideosProps) => {
  const videos = parseVideos(module.content);

  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Video className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Sem vídeos disponíveis</h3>
        <p className="text-muted-foreground max-w-md">
          Esta solução não possui vídeos educacionais no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Vídeos Educacionais</h3>
        <p className="text-muted-foreground">
          Assista aos vídeos para aprender como implementar esta solução.
        </p>
      </div>

      <div className="grid gap-4">
        {videos.map((video: any, index: number) => (
          <Card key={video.id || index} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Play className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base mb-1 line-clamp-2">
                    {video.title || `Vídeo ${index + 1}`}
                  </CardTitle>
                  {video.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{video.duration || "Duração não informada"}</span>
                </div>
                <button 
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                  onClick={() => {
                    if (video.url) {
                      window.open(video.url, '_blank');
                    }
                  }}
                >
                  Assistir →
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
