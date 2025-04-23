
import React from "react";
import { Module } from "@/lib/supabase";
import { useVideosData } from "@/hooks/implementation/useVideosData";
import { VideoPlayer } from "@/components/common/VideoPlayer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Video } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentVideosProps {
  module: Module;
}

export const ModuleContentVideos: React.FC<ModuleContentVideosProps> = ({ module }) => {
  const { videos, loading } = useVideosData(module);
  const { log } = useLogging("ModuleContentVideos");

  // Log para diagnóstico
  React.useEffect(() => {
    log("ModuleContentVideos renderizado", { 
      module_id: module.id,
      videos_count: videos?.length || 0
    });
  }, [module.id, videos, log]);

  if (loading) {
    return (
      <GlassCard className="p-6 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="aspect-video bg-gray-100 rounded-lg"></div>
      </GlassCard>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <GlassCard className="p-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-gray-100 rounded-full">
            <Video className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium">Nenhum vídeo disponível</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Não existem vídeos cadastrados para esta solução ou módulo.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      <h3 className="text-lg font-semibold">Vídeos</h3>
      
      <div className="space-y-6">
        {videos.map((video) => (
          <GlassCard key={video.id} className="overflow-hidden">
            <div className="aspect-video">
              <VideoPlayer
                url={video.url}
                title={video.title}
                type={video.type || "youtube"}
              />
            </div>
            {(video.title || video.description) && (
              <div className="p-4">
                {video.title && <h4 className="font-medium text-[#0ABAB5] mb-1">{video.title}</h4>}
                {video.description && <p className="text-sm text-muted-foreground">{video.description}</p>}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
