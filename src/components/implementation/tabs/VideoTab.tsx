import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, CheckCircle } from "lucide-react";
import { PandaVideoPlayer } from "@/components/formacao/comum/PandaVideoPlayer";
import { useToastModern } from "@/hooks/useToastModern";

interface VideoTabProps {
  solutionId: string;
  onComplete: () => void;
  onAdvanceToNext?: () => void;
  isCompleted?: boolean;
}

interface VideoLesson {
  id: string;
  title: string;
  description?: string;
  url: string;
  video_id?: string;
  order_index?: number;
}

const VideoTab: React.FC<VideoTabProps> = ({ solutionId, onComplete, onAdvanceToNext, isCompleted }) => {
  const [isWatched, setIsWatched] = useState(isCompleted || false);
  const { showSuccess } = useToastModern();

  const extractPandaVideoId = (url: string): string | null => {
    try {
      const patterns = [
        /pandavideo\.com\.br\/embed\/\?v=([^&]+)/,
        /player-vz-[^.]+\.tv\.pandavideo\.com\.br\/embed\/\?v=([^&]+)/,
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
      }
      return null;
    } catch {
      return null;
    }
  };

  const { data: videoLessons, isLoading } = useQuery({
    queryKey: ['solution-video-resources', solutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_resources')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('type', 'video')
        .is('module_id', null);

      if (error) throw error;
      
      // Transformar os dados para o formato esperado
      const transformedData = data?.map(resource => ({
        id: resource.id,
        title: resource.name,
        description: resource.description || resource.format,
        url: resource.url,
        video_id: resource.metadata?.videoId || extractPandaVideoId(resource.url),
        order_index: resource.order_index || 0
      })) || [];
      
      return transformedData;
    }
  });

  const handleVideoProgress = (progress: number) => {
    if (progress >= 95) {
      onComplete();
    }
  };

  const handleMarkAsWatched = () => {
    setIsWatched(true);
    onComplete();
    showSuccess("Progresso registrado", "Você assistiu aos vídeos da solução.");
    
    setTimeout(() => {
      if (onAdvanceToNext) {
        onAdvanceToNext();
      }
    }, 1000);
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
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Vídeos da Solução</h2>
        <p className="text-muted-foreground">
          Assista aos vídeos para entender como implementar esta solução
        </p>
      </div>

      <div className="space-y-6">
        {videoLessons.map((video, index) => (
          <div key={video.id} className="w-full">
            {/* Video Player Only */}
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg border bg-black/5">
              <PandaVideoPlayer
                videoId={video.video_id || video.url}
                url={video.url}
                title={video.title}
                className="w-full h-full"
                onProgress={handleVideoProgress}
                onEnded={() => {
                  if (index === videoLessons.length - 1) {
                    onComplete();
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Progress Indicator for Multiple Videos */}
      {videoLessons.length > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {videoLessons.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-muted transition-colors"
              />
            ))}
          </div>
        </div>
      )}

      {/* Botão para marcar como assistido */}
      <div className="text-center mt-8 p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent backdrop-blur-sm rounded-2xl border-0">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Terminou de assistir?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Após assistir aos vídeos acima, confirme que você compreendeu o conteúdo apresentado sobre a implementação da solução.
          </p>
          <Button 
            onClick={handleMarkAsWatched}
            disabled={isWatched}
            className="bg-primary/90 hover:bg-primary px-8"
          >
            {isWatched ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluído
              </>
            ) : (
              "Já assisti aos vídeos"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoTab;