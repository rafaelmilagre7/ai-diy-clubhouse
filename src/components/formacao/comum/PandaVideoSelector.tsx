
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  Loader2, 
  Search,
  Check,
  Video,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToastModern } from "@/hooks/useToastModern";
import { PandaVideoPlayer } from "./PandaVideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";

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
  url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  created_at?: string;
}

export const PandaVideoSelector: React.FC<PandaVideoSelectorProps> = ({
  onSelect,
  currentVideoId
}) => {
  const [videos, setVideos] = useState<PandaVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<PandaVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(currentVideoId || null);
  const { showError, showSuccess } = useToastModern();

  // Buscar vídeos do Panda Video
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Chamada para Edge Function ou API do Supabase
      const { data, error } = await supabase.functions.invoke('list-panda-videos', {
        body: { limit: 50 }  // Solicitar os últimos 50 vídeos
      });

      if (error) {
        throw error;
      }

      if (data && data.videos) {
        setVideos(data.videos);
        setFilteredVideos(data.videos);
      } else {
        setVideos([]);
        setFilteredVideos([]);
      }
    } catch (err: any) {
      console.error("Erro ao buscar vídeos do Panda Video:", err);
      setError(err.message || "Não foi possível carregar os vídeos. Tente novamente mais tarde.");
      showError("Erro ao carregar vídeos", "Não foi possível obter a lista de vídeos do Panda Video.");
    } finally {
      setLoading(false);
    }
  };

  // Carregar vídeos ao iniciar
  useEffect(() => {
    fetchVideos();
  }, []);

  // Filtrar vídeos quando a busca mudar
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVideos(videos);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = videos.filter((video) =>
        video.title.toLowerCase().includes(lowerQuery) ||
        (video.description && video.description.toLowerCase().includes(lowerQuery))
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, videos]);

  const handleVideoSelect = (video: PandaVideo) => {
    setSelectedVideoId(video.id);
    onSelect({
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      duration_seconds: video.duration_seconds,
    });
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "00:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleRetry = () => {
    fetchVideos();
    showSuccess("Tentando novamente", "Buscando vídeos do Panda Video...");
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </div>
            <Button 
              size="sm" 
              onClick={handleRetry} 
              variant="outline"
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Tentar novamente
            </Button>
          </div>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar vídeo por título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchVideos} 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="border rounded-md p-1 overflow-hidden">
        <div className="max-h-modal-sm overflow-y-auto p-1 space-y-2">
          {loading ? (
            // Esqueletos para carregamento
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-start space-x-2 p-2 border rounded-md">
                <Skeleton className="h-16 w-28 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <p>Nenhum vídeo encontrado para "{searchQuery}"</p>
              ) : error ? (
                <div className="flex flex-col items-center gap-2">
                  <p>Não foi possível carregar os vídeos.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetry}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Tentar novamente
                  </Button>
                </div>
              ) : (
                <p>Nenhum vídeo disponível. Faça upload de novos vídeos.</p>
              )}
            </div>
          ) : (
            filteredVideos.map((video) => (
              <div
                key={video.id}
                className={`flex items-start space-x-3 p-2 border rounded-md cursor-pointer transition-colors hover:bg-muted ${
                  selectedVideoId === video.id ? "bg-operational/10 border-operational/30" : ""
                }`}
                onClick={() => handleVideoSelect(video)}
              >
                <div className="relative h-16 w-28 flex-shrink-0 bg-muted rounded overflow-hidden">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {video.duration_seconds && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {formatDuration(video.duration_seconds)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">{video.title}</p>
                  {video.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {video.description}
                    </p>
                  )}
                  <div className="text-2xs text-muted-foreground mt-1">
                    {formatDate(video.created_at)}
                  </div>
                </div>
                
                {selectedVideoId === video.id && (
                  <div className="self-center">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedVideoId && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Prévia do vídeo selecionado:</p>
          <PandaVideoPlayer 
            videoId={selectedVideoId} 
            title="Prévia"
          />
        </div>
      )}
    </div>
  );
};
