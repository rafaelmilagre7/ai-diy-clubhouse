
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { Video, Youtube } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface SolutionVideosTabProps {
  solution: any;
}

interface VideoItem {
  id: string;
  name: string;
  url: string;
  type: "video";
  metadata?: {
    source?: "youtube" | "upload";
    youtube_id?: string;
    thumbnail_url?: string;
  };
}

const SolutionVideosTab: React.FC<SolutionVideosTabProps> = ({ solution }) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const { toast } = useToast();
  const { log, logError } = useLogging("SolutionVideosTab");

  useEffect(() => {
    const fetchVideos = async () => {
      if (!solution?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Buscar vídeos vinculados a esta solução
        const { data, error } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solution.id)
          .eq("type", "video")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        setVideos(data || []);
      } catch (error) {
        logError("Erro ao carregar vídeos", { error });
        toast({
          title: "Erro ao carregar vídeos",
          description: "Não foi possível carregar os vídeos desta solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [solution?.id, toast, log, logError]);

  // Registrar visualização para métricas
  const handleVideoView = (video: VideoItem) => {
    try {
      log("Vídeo visualizado", { 
        video_id: video.id,
        video_name: video.name,
        solution_id: solution.id 
      });
      setSelectedVideo(video);
    } catch (error) {
      // Silenciosamente falhar
      logError("Erro ao registrar visualização de vídeo", { error });
    }
  };

  // Renderizar thumbnail para vídeos do YouTube
  const renderThumbnail = (video: VideoItem) => {
    const isYoutube = video.metadata?.source === "youtube";
    const thumbnailUrl = isYoutube 
      ? video.metadata?.thumbnail_url || `https://img.youtube.com/vi/${video.metadata?.youtube_id}/mqdefault.jpg`
      : null;
      
    return (
      <div className="relative aspect-video bg-black rounded-md overflow-hidden">
        {isYoutube && thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={video.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Video className="h-10 w-10 text-muted" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 rounded-full p-3">
            {isYoutube ? (
              <Youtube className="h-8 w-8 text-red-500" />
            ) : (
              <Video className="h-8 w-8 text-white" />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhum vídeo disponível para esta solução.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Dialog key={video.id}>
            <DialogTrigger asChild>
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleVideoView(video)}
              >
                <CardContent className="p-3">
                  {renderThumbnail(video)}
                  <h3 className="mt-2 font-medium line-clamp-1">{video.name}</h3>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-0">
              <div className="aspect-video w-full">
                {video.metadata?.source === "youtube" ? (
                  <iframe 
                    src={video.url} 
                    title={video.name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={video.url} 
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Video Modal */}
      <Dialog>
        <DialogContent className="sm:max-w-[800px] p-0">
          <div className="aspect-video w-full">
            {selectedVideo?.metadata?.source === "youtube" ? (
              <iframe 
                src={selectedVideo?.url} 
                title={selectedVideo?.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video 
                src={selectedVideo?.url} 
                controls
                autoPlay
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SolutionVideosTab;
