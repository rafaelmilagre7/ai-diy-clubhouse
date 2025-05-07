
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Video, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatVideoDuration } from "@/lib/supabase/videoUtils";
import { PandaVideoPlayer } from "./PandaVideoPlayer";

interface PandaVideo {
  id: string;
  title: string;
  description?: string;
  duration_seconds: number;
  thumbnail_url: string;
  url: string;
  status?: string;
}

interface PandaVideoSelectorProps {
  onSelect: (videoData: PandaVideo) => void;
  currentVideoId?: string;
}

export const PandaVideoSelector = ({
  onSelect,
  currentVideoId
}: PandaVideoSelectorProps) => {
  const [videos, setVideos] = useState<PandaVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(currentVideoId || null);
  const [previewVideo, setPreviewVideo] = useState<PandaVideo | null>(null);
  
  const fetchVideos = async (search?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado. Faça login para continuar.");
      }

      // Construir a URL da edge function com parâmetros de busca
      let functionUrl = 'list-panda-videos';
      const params = new URLSearchParams();
      
      if (search) {
        params.append("search", search);
      }
      
      const paramString = params.toString();
      if (paramString) {
        functionUrl += `?${paramString}`;
      }

      console.log("Buscando vídeos do Panda Video...");
      const { data, error } = await supabase.functions.invoke(functionUrl, {
        method: 'GET'
      });
      
      console.log("Resposta da função list-panda-videos:", data);
      
      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || "Falha ao buscar vídeos");
      }

      setVideos(data.videos || []);
      
      if (data.videos && data.videos.length === 0) {
        toast.info("Nenhum vídeo encontrado no Panda Video");
      }
    } catch (err: any) {
      console.error("Erro ao buscar vídeos:", err);
      setError(err.message || "Erro ao buscar vídeos do Panda Video");
      toast.error("Erro ao carregar vídeos", {
        description: err.message || "Não foi possível buscar os vídeos no momento."
      });
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar vídeos ao montar o componente
  useEffect(() => {
    fetchVideos();
  }, []);
  
  // Se um ID de vídeo foi passado, encontrar e definir como preview
  useEffect(() => {
    if (currentVideoId && videos.length > 0) {
      const current = videos.find(v => v.id === currentVideoId);
      if (current) {
        setPreviewVideo(current);
      }
    }
  }, [currentVideoId, videos]);

  const handleSearch = () => {
    fetchVideos(searchQuery);
  };

  const handleSelectVideo = (video: PandaVideo) => {
    setSelectedVideoId(video.id);
    setPreviewVideo(video);
    onSelect(video);
    toast.success("Vídeo selecionado com sucesso");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Buscar por título..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button variant="outline" onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
        </Button>
      </div>
      
      {error && (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : previewVideo ? (
        <div className="space-y-4">
          <div className="relative">
            <PandaVideoPlayer 
              videoId={previewVideo.id} 
              title={previewVideo.title} 
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={() => setPreviewVideo(null)}
            >
              Voltar à lista
            </Button>
          </div>
          <div className="p-3 border rounded-md">
            <h3 className="font-medium">{previewVideo.title}</h3>
            {previewVideo.description && (
              <p className="text-sm text-muted-foreground mt-1">{previewVideo.description}</p>
            )}
            {previewVideo.duration_seconds > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Duração: {formatVideoDuration(previewVideo.duration_seconds)}
              </p>
            )}
            <Button 
              variant="default" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => handleSelectVideo(previewVideo)}
            >
              Usar este vídeo
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {videos.length > 0 ? (
            videos.map(video => (
              <Card 
                key={video.id} 
                className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  selectedVideoId === video.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setPreviewVideo(video)}
              >
                <div className="relative aspect-video bg-muted">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {video.duration_seconds > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
                      {formatVideoDuration(video.duration_seconds)}
                    </div>
                  )}
                  {selectedVideoId === video.id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium truncate text-sm">{video.title || "Sem título"}</h3>
                  {video.status && (
                    <p className={`text-xs mt-1 ${
                      video.status === 'ready' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      Status: {video.status === 'ready' ? 'Pronto' : 'Processando'}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-8 border-2 border-dashed rounded-md text-center">
              <Video className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {error ? 'Ocorreu um erro ao carregar os vídeos' : 'Nenhum vídeo encontrado. Faça upload ou busca por um vídeo.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
