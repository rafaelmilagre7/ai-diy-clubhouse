import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { PandaVideoPlayer } from "@/components/formacao/comum/PandaVideoPlayer";

interface VideoTabProps {
  solutionId: string;
  onComplete: () => void;
}

interface VideoLesson {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  video_id?: string;
  order_index?: number;
}

const VideoTab: React.FC<VideoTabProps> = ({ solutionId, onComplete }) => {

  const { data: videoLessons, isLoading } = useQuery({
    queryKey: ['solution-video-resources', solutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_resources')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('type', 'video')
        .is('module_id', null)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      // Transformar os dados para o formato esperado
      return data?.map(resource => ({
        id: resource.id,
        title: resource.name,
        description: resource.description,
        video_url: resource.external_url,
        video_id: resource.file_path,
        order_index: resource.order_index
      })) || [];
    }
  });

  const handleVideoProgress = (progress: number) => {
    if (progress >= 95) {
      onComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!videoLessons || videoLessons.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum vídeo encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Esta solução não possui vídeos de implementação.
        </p>
        <Button onClick={onComplete} variant="outline">
          Continuar para próxima etapa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Vídeos da Solução</h2>
        <p className="text-muted-foreground">
          Assista aos vídeos para entender como implementar esta solução
        </p>
      </div>

      <div className="space-y-4">
        {videoLessons.map((video, index) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
              {video.description && (
                <p className="text-muted-foreground mb-4">{video.description}</p>
              )}
            </div>
            
            <div className="aspect-video">
              <PandaVideoPlayer
                videoId={video.video_id || video.video_url}
                url={video.video_url}
                title={video.title}
                onProgress={handleVideoProgress}
                onEnded={() => {
                  if (index === videoLessons.length - 1) {
                    onComplete();
                  }
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VideoTab;