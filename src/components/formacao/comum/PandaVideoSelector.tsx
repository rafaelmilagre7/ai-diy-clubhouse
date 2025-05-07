
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2, Video, Check, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatVideoDuration } from "@/lib/supabase/videoUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/ui/pagination";

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  url: string;
  status: string;
  created_at: string;
}

interface PagingInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PandaVideoSelectorProps {
  onSelectVideo: (videoData: any) => void;
}

export const PandaVideoSelector = ({ onSelectVideo }: PandaVideoSelectorProps) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState<PagingInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // Buscar vídeos da biblioteca
  const fetchVideos = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    
    try {
      // Correção: Usar 'body' em vez de 'query' para passar os parâmetros
      const { data, error } = await supabase.functions.invoke("list-panda-videos", {
        method: "POST", // Alterar para POST já que estamos enviando dados no body
        body: {
          page: page,
          limit: pagination.limit,
          search: search || ""
        }
      });
      
      if (error) {
        console.error("Erro ao buscar vídeos:", error);
        setError("Não foi possível carregar os vídeos. " + error.message);
        toast.error("Erro ao listar vídeos", {
          description: error.message
        });
        return;
      }
      
      if (!data.success) {
        console.error("Erro na API:", data);
        setError(data.error || "Falha ao buscar vídeos");
        toast.error("Erro ao listar vídeos", {
          description: data.error || "Falha ao carregar biblioteca de vídeos"
        });
        return;
      }
      
      setVideos(data.videos || []);
      
      if (data.pagination) {
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        });
      }
    } catch (err: any) {
      console.error("Erro ao buscar vídeos:", err);
      setError("Falha na comunicação com o servidor: " + err.message);
      toast.error("Erro ao listar vídeos", {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar vídeos ao montar componente
  useEffect(() => {
    fetchVideos(1, searchText);
  }, []);
  
  // Manipular busca
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos(1, searchText);
  };
  
  // Manipular paginação
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.page) return;
    fetchVideos(page, searchText);
  };
  
  // Selecionar vídeo
  const handleSelectVideo = (video: VideoItem) => {
    setSelectedVideoId(video.id);
    
    const videoData = {
      video_id: video.id,
      title: video.title,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      duration_seconds: video.duration_seconds,
      description: video.description || "",
      type: "panda"
    };
    
    onSelectVideo(videoData);
    
    toast.success("Vídeo selecionado", {
      description: `"${video.title}" foi selecionado com sucesso!`
    });
  };
  
  // Tentar novamente após erro
  const handleRetry = () => {
    fetchVideos(pagination.page, searchText);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Buscar vídeos por título..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1"
          disabled={loading}
        />
        <Button 
          type="submit"
          variant="outline"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-1 hidden sm:inline">Buscar</span>
        </Button>
      </form>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-video w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 border border-destructive/20 bg-destructive/10 rounded-md">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Erro ao carregar vídeos</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button 
            onClick={handleRetry}
            variant="outline"
            className="mt-4"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      ) : videos.length === 0 ? (
        <div className="p-8 border-2 border-dashed rounded-md text-center">
          <Video className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <p className="font-medium">Nenhum vídeo encontrado</p>
          <p className="text-muted-foreground mt-1">
            {searchText 
              ? "Tente usar termos de busca diferentes" 
              : "Faça upload de vídeos para sua conta Panda Video"
            }
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="max-h-[500px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Card 
                  key={video.id} 
                  className={`overflow-hidden cursor-pointer transition-all ${
                    selectedVideoId === video.id 
                      ? 'border-primary ring-1 ring-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectVideo(video)}
                >
                  <div className="relative aspect-video">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted">
                        <Video className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    
                    {video.duration_seconds > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 px-1 py-0.5 rounded text-xs text-white">
                        {formatVideoDuration(video.duration_seconds)}
                      </div>
                    )}
                    
                    {selectedVideoId === video.id && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1">{video.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(video.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          {pagination.totalPages > 1 && (
            <Pagination className="flex justify-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                Anterior
              </Button>
              
              <span className="mx-4 flex items-center text-sm">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Próxima
              </Button>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};
