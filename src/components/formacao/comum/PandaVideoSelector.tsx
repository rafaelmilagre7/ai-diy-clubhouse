
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatVideoDuration } from "@/lib/supabase/videoUtils";
import { supabase } from "@/lib/supabase";

interface PandaVideoSelectorProps {
  onSelect: (videoData: {
    id: string;
    title: string;
    description?: string;
    url: string;
    thumbnail_url?: string;
    duration_seconds?: number;
  }) => void;
  currentVideoId?: string;
}

interface PandaVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  url?: string;
  created_at?: string;
}

export const PandaVideoSelector: React.FC<PandaVideoSelectorProps> = ({
  onSelect,
  currentVideoId
}) => {
  const [videos, setVideos] = useState<PandaVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(currentVideoId || null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar a lista de vídeos cadastrados no Panda Video
      const { data, error } = await supabase
        .functions
        .invoke('list-panda-videos', {});
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && Array.isArray(data)) {
        // Verificar se há dados válidos no resultado
        const processedVideos: PandaVideo[] = data.map(video => ({
          id: video.id,
          title: video.title || "Vídeo sem título",
          description: video.description || "",
          thumbnail_url: video.thumbnail?.standard || "",
          duration_seconds: video.duration ? parseInt(video.duration) : 0,
          url: `https://player.pandavideo.com.br/embed/?v=${video.id}`,
          created_at: video.created_at
        }));
        
        // Ordenar por data de criação (mais recentes primeiro)
        processedVideos.sort((a, b) => {
          if (!a.created_at || !b.created_at) return 0;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        setVideos(processedVideos);
      } else {
        setVideos([]);
      }
    } catch (err: any) {
      console.error("Erro ao buscar vídeos:", err);
      setError(err.message || "Erro ao carregar a lista de vídeos");
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar vídeos na montagem do componente
  useEffect(() => {
    fetchVideos();
  }, []);
  
  // Filtrar vídeos com base na busca
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Selecionar um vídeo
  const handleSelectVideo = (video: PandaVideo) => {
    setSelectedVideoId(video.id);
    
    // Chamar o callback com os dados do vídeo
    onSelect({
      id: video.id,
      title: video.title,
      description: video.description,
      url: `https://player.pandavideo.com.br/embed/?v=${video.id}`,
      thumbnail_url: video.thumbnail_url,
      duration_seconds: video.duration_seconds
    });
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-8 w-full" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-28" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchVideos}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar vídeos..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {filteredVideos.length === 0 ? (
        <div className="text-center p-4 border rounded-md bg-muted/20">
          {searchQuery ? (
            <p className="text-muted-foreground">Nenhum vídeo encontrado para "{searchQuery}"</p>
          ) : (
            <p className="text-muted-foreground">Nenhum vídeo disponível</p>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchVideos}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Atualizar lista
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-52">
          <div className="space-y-2">
            {filteredVideos.map((video) => (
              <div 
                key={video.id}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                  selectedVideoId === video.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                }`}
                onClick={() => handleSelectVideo(video)}
              >
                <div className="relative w-28 h-16 bg-muted rounded overflow-hidden">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs">
                      Sem miniatura
                    </div>
                  )}
                  
                  {video.duration_seconds > 0 && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 text-xs rounded">
                      {formatVideoDuration(video.duration_seconds)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-sm font-medium line-clamp-1">{video.title}</h4>
                  {video.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
                
                {selectedVideoId === video.id && (
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchVideos}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Atualizar lista
        </Button>
      </div>
    </div>
  );
};
