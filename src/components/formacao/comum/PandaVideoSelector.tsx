
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2, Video, Check, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatVideoDuration } from "@/lib/supabase/videoUtils";
import { PandaVideoPlayer } from "./PandaVideoPlayer";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(currentVideoId || null);
  const [previewVideo, setPreviewVideo] = useState<PandaVideo | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [retrying, setRetrying] = useState(false);
  
  const fetchVideos = async (search?: string, pageNum = 1, reset = true) => {
    if (reset) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado. Faça login para continuar.");
      }

      console.log("Iniciando busca de vídeos Panda Video (página " + pageNum + ")...");
      
      // Construir a URL da edge function com parâmetros de busca
      let functionUrl = 'list-panda-videos';
      const params = new URLSearchParams();
      
      if (search) {
        params.append("search", search);
      }
      
      params.append("page", pageNum.toString());
      params.append("limit", "12"); // Limite de itens por página
      
      const paramString = params.toString();
      if (paramString) {
        functionUrl += `?${paramString}`;
      }

      const { data, error: invokeError } = await supabase.functions.invoke(functionUrl, {
        method: 'GET'
      });
      
      if (invokeError) {
        console.error("Erro ao invocar função list-panda-videos:", invokeError);
        throw new Error(invokeError.message || "Falha ao buscar vídeos");
      }
      
      console.log("Resposta da função list-panda-videos:", data);
      
      if (!data || !data.success) {
        throw new Error(data?.error || "Falha ao buscar vídeos");
      }

      if (reset) {
        setVideos(data.videos || []);
      } else {
        setVideos(prev => [...prev, ...(data.videos || [])]);
      }
      
      // Verificar se há mais páginas
      setHasMore(data.pagination && data.pagination.page < data.pagination.totalPages);
      setPage(data.pagination?.page || 1);
      
      if (data.videos && data.videos.length === 0 && pageNum === 1) {
        toast.info("Nenhum vídeo encontrado no Panda Video");
      } else {
        console.log(`${data.videos?.length || 0} vídeos encontrados`);
      }
    } catch (err: any) {
      console.error("Erro ao buscar vídeos:", err);
      setError(err.message || "Erro ao buscar vídeos do Panda Video");
      toast.error("Erro ao carregar vídeos", {
        description: err.message || "Não foi possível buscar os vídeos no momento."
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreVideos = () => {
    fetchVideos(searchQuery, page + 1, false);
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
        setSelectedVideoId(current.id);
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

  const handleRetryLoad = () => {
    setRetrying(true);
    fetchVideos()
      .finally(() => setRetrying(false));
  };
  
  // Renderizar placeholders durante carregamento
  const renderLoadingSkeletons = () => {
    return Array(6).fill(0).map((_, i) => (
      <Card key={`skeleton-${i}`} className="overflow-hidden">
        <div className="aspect-video bg-muted">
          <Skeleton className="w-full h-full" />
        </div>
        <CardContent className="p-3">
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    ));
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
        <Button 
          variant="outline" 
          onClick={handleSearch} 
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRetryLoad} 
          disabled={loading || retrying} 
          title="Atualizar lista"
        >
          <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="flex flex-col">
            <span className="font-medium">Erro ao carregar vídeos</span>
            <span className="text-sm">{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryLoad}
              className="mt-2 self-start" 
              disabled={retrying}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {loading && videos.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {renderLoadingSkeletons()}
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
            <h3 className="font-medium">{previewVideo.title || "Vídeo sem título"}</h3>
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
              {selectedVideoId === previewVideo.id ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Vídeo selecionado
                </>
              ) : (
                "Usar este vídeo"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  {error ? 'Ocorreu um erro ao carregar os vídeos' : 'Nenhum vídeo encontrado. Tente fazer uma busca ou envie um novo vídeo.'}
                </p>
              </div>
            )}
          </div>
          
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={loadMoreVideos} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Carregar mais"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
