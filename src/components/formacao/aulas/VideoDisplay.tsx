
import React, { useState, useEffect } from "react";
import { supabase, LearningLessonVideo } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getYoutubeVideoId, formatVideoDuration } from "@/lib/supabase/storage";
import { toast } from "sonner";

interface VideoDisplayProps {
  lessonId: string;
  onVideoSelect?: (video: LearningLessonVideo) => void;
}

export const VideoDisplay: React.FC<VideoDisplayProps> = ({
  lessonId,
  onVideoSelect
}) => {
  const [videos, setVideos] = useState<LearningLessonVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  
  // Buscar os vídeos da aula
  useEffect(() => {
    if (!lessonId) return;
    
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('learning_lesson_videos')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order_index');
          
        if (error) {
          console.error("Erro ao buscar vídeos:", error);
          toast.error("Erro ao carregar os vídeos da aula");
          return;
        }
        
        setVideos(data || []);
        
        // Definir o primeiro vídeo como ativo se houver vídeos e onVideoSelect for fornecido
        if (data && data.length > 0 && onVideoSelect) {
          setActiveVideoId(data[0].id);
          onVideoSelect(data[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar vídeos:", error);
        toast.error("Ocorreu um erro ao carregar os vídeos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [lessonId, onVideoSelect]);
  
  // Função para selecionar um vídeo
  const handleVideoClick = (video: LearningLessonVideo) => {
    setActiveVideoId(video.id);
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };
  
  // Se estiver carregando, mostrar esqueletos
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vídeos da aula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="h-16 w-28 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Se não houver vídeos, mostrar mensagem
  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vídeos da aula</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            Nenhum vídeo disponível para esta aula.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vídeos da aula</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => {
            const isYoutube = video.video_type === 'youtube';
            const thumbnailUrl = isYoutube && video.url 
              ? `https://img.youtube.com/vi/${getYoutubeVideoId(video.url)}/mqdefault.jpg` 
              : video.thumbnail_url || '/placeholder-video.png';
              
            return (
              <div 
                key={video.id}
                className={`flex gap-3 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  activeVideoId === video.id ? 'bg-muted border border-primary/30' : ''
                }`}
                onClick={() => handleVideoClick(video)}
              >
                {/* Thumbnail */}
                <div className="relative w-28 h-16 overflow-hidden rounded">
                  <img
                    src={thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {video.duration_seconds > 0 && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {formatVideoDuration(video.duration_seconds)}
                    </div>
                  )}
                </div>
                
                {/* Informações do vídeo */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{video.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isYoutube ? "YouTube" : "Vídeo"}
                    {video.file_size_bytes && ` • ${Math.round(video.file_size_bytes / 1024 / 1024)} MB`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
