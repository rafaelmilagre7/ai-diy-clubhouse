
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Video, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatVideoDuration } from "@/lib/supabase/videoUtils";

interface PandaVideo {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  created_at?: string;
}

interface PandaVideoSelectorProps {
  onSelect: (video: PandaVideo) => void;
  currentVideoId?: string;
}

export const PandaVideoSelector: React.FC<PandaVideoSelectorProps> = ({
  onSelect,
  currentVideoId
}) => {
  const [videos, setVideos] = useState<PandaVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<PandaVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PandaVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Buscar lista de vídeos do Panda Video
  const fetchPandaVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("list-panda-videos");
      
      if (error) {
        console.error("Erro ao buscar vídeos:", error);
        setError("Não foi possível carregar os vídeos. Tente novamente mais tarde.");
        return;
      }
      
      if (Array.isArray(data?.videos)) {
        const formattedVideos = data.videos.map((video: any) => ({
          id: video.id,
          title: video.title || "Vídeo sem título",
          description: video.description || "",
          url: `https://player.pandavideo.com.br/embed/${video.id}`,
          thumbnail_url: video.thumbnail_url,
          duration_seconds: video.duration_seconds,
          created_at: video.created_at
        }));
        
        setVideos(formattedVideos);
        setFilteredVideos(formattedVideos);
      } else {
        setError("Formato de resposta inválido ao buscar vídeos.");
      }
    } catch (err) {
      console.error("Erro ao buscar vídeos:", err);
      setError("Ocorreu um erro ao buscar os vídeos.");
    } finally {
      setLoading(false);
    }
  };
  
  // Efeito para buscar vídeos quando o diálogo for aberto
  useEffect(() => {
    if (dialogOpen) {
      fetchPandaVideos();
    }
  }, [dialogOpen]);
  
  // Efeito para filtrar vídeos quando a busca mudar
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVideos(videos);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = videos.filter(
        video => 
          video.title?.toLowerCase().includes(query) || 
          video.description?.toLowerCase().includes(query)
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, videos]);
  
  // Verificar se existe um vídeo já selecionado
  useEffect(() => {
    if (currentVideoId && videos.length > 0) {
      const current = videos.find(video => video.id === currentVideoId);
      if (current) {
        setSelectedVideo(current);
      }
    }
  }, [currentVideoId, videos]);

  // Função para selecionar um vídeo
  const handleSelectVideo = (video: PandaVideo) => {
    setSelectedVideo(video);
    onSelect(video);
    setDialogOpen(false);
  };

  // Renderizar preview do vídeo selecionado
  const renderSelectedVideo = () => {
    if (!selectedVideo) return null;
    
    return (
      <Card className="relative">
        <CardContent className="p-0">
          <div className="aspect-video w-full">
            <iframe
              src={selectedVideo.url}
              className="w-full h-full"
              allowFullScreen
              title={selectedVideo.title}
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium line-clamp-1">{selectedVideo.title}</h3>
            {selectedVideo.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {selectedVideo.description}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedVideo.duration_seconds && formatVideoDuration(selectedVideo.duration_seconds)}
              </span>
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs flex items-center"
                onClick={() => window.open(selectedVideo.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir no Panda
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {selectedVideo ? (
        <div className="space-y-2">
          {renderSelectedVideo()}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
              Trocar Vídeo
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full py-8 flex flex-col items-center justify-center border-dashed gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <Video className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">Selecionar Vídeo do Panda</p>
            <p className="text-xs text-muted-foreground mt-1">
              Escolha um vídeo já enviado para o Panda Video
            </p>
          </div>
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Vídeo</DialogTitle>
            <DialogDescription>
              Escolha um vídeo da sua biblioteca do Panda Video
            </DialogDescription>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar vídeos..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full aspect-video" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium">Nenhum vídeo encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Não há vídeos disponíveis ou que correspondam à sua pesquisa.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVideos.map((video) => (
                <Card 
                  key={video.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                    selectedVideo?.id === video.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectVideo(video)}
                >
                  <div className="relative w-full aspect-video bg-gray-100">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    {video.duration_seconds && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatVideoDuration(video.duration_seconds)}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-medium line-clamp-2 text-sm">{video.title}</h3>
                    {video.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {video.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => fetchPandaVideos()}
              disabled={loading}
              variant="ghost"
              className="flex items-center gap-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Atualizar Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
