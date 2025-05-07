
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Search, 
  Loader2, 
  Film, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  AlertCircle,
  RefreshCw 
} from "lucide-react";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { setupLearningStorageBuckets } from "@/lib/supabase";

interface PandaVideoSelectorProps {
  onSelectVideo: (videoData: any) => void;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const PandaVideoSelector = ({ onSelectVideo }: PandaVideoSelectorProps) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const [retrying, setRetrying] = useState(false);

  // Verificar e criar bucket de armazenamento, se necessário
  useEffect(() => {
    const checkAndCreateBuckets = async () => {
      try {
        // Verificar se o bucket de vídeos existe e criá-lo se necessário
        await setupLearningStorageBuckets();
      } catch (error) {
        console.error("Erro ao configurar buckets:", error);
      }
    };

    checkAndCreateBuckets();
  }, []);

  // Função para buscar vídeos
  const fetchVideos = async (page = 1, query = "") => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("list-panda-videos", {
        body: {
          page: page,
          limit: pagination.limit,
          search: query
        },
        method: 'POST'
      });

      if (error) {
        console.error("Erro na invocação da função:", error);
        throw new Error(error.message);
      }
      
      if (!data.success) {
        console.error("Erro retornado pela API:", data);
        throw new Error(data.message || data.error || "Erro ao buscar vídeos");
      }
      
      setVideos(data.videos || []);
      setPagination({
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 12,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 1
      });
      
    } catch (err: any) {
      console.error("Falha ao buscar vídeos:", err);
      
      // Fornecer mensagem de erro amigável
      let errorMessage = "Não foi possível carregar os vídeos";
      
      if (err.message?.includes("network") || err.message?.includes("timeout")) {
        errorMessage = "Problema de conexão ao carregar vídeos. Verifique sua internet e tente novamente.";
      } else if (err.message?.includes("auth") || err.message?.includes("401")) {
        errorMessage = "Problema de autenticação ao conectar com o serviço de vídeo.";
      }
      
      setError(errorMessage);
      toast.error("Erro ao carregar biblioteca de vídeos", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  // Carregar vídeos inicialmente
  useEffect(() => {
    fetchVideos(pagination.page, searchQuery);
  }, []);

  // Função para lidar com a pesquisa
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos(1, searchQuery);
  };

  // Função para navegar entre as páginas
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchVideos(newPage, searchQuery);
  };

  // Função para selecionar um vídeo
  const handleSelectVideo = (video: any) => {
    const videoData = {
      url: video.url,
      type: "panda",
      title: video.title,
      video_id: video.id,
      thumbnail_url: video.thumbnail_url,
      duration_seconds: video.duration_seconds
    };
    
    onSelectVideo(videoData);
    toast.success("Vídeo selecionado com sucesso!");
  };

  // Função para tentar novamente após um erro
  const handleRetry = () => {
    setRetrying(true);
    fetchVideos(pagination.page, searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Barra de pesquisa */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Procurar vídeos..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading || retrying}
          />
        </div>
        <Button type="submit" disabled={loading || retrying}>
          Buscar
        </Button>
      </form>

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar vídeos</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-fit" 
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de vídeos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden group cursor-pointer hover:border-primary transition-colors">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/640x360?text=Video';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted">
                      <Film className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  
                  {video.duration_seconds > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{video.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(video.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => handleSelectVideo(video)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Selecionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum vídeo encontrado</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? `Não encontramos vídeos para "${searchQuery}"` : "Sua biblioteca de vídeos está vazia"}
          </p>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground italic mt-4 text-center">
        Vídeos recém-enviados podem demorar alguns minutos para aparecer na biblioteca.
      </div>
    </div>
  );
};
