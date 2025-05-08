
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatVideoDuration } from "@/lib/supabase/videoUtils";
import { Loader2, Search, Video } from "lucide-react";

interface PandaVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  created_at?: string;
  url: string;
}

interface PandaVideoSelectorProps {
  onSelect: (video: PandaVideo) => void;
  currentVideoId?: string;
}

export const PandaVideoSelector: React.FC<PandaVideoSelectorProps> = ({
  onSelect,
  currentVideoId,
}) => {
  const [videos, setVideos] = useState<PandaVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PandaVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PandaVideo | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const { toast } = useToast();

  // Função para buscar vídeos do Panda
  const fetchPandaVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Usuário não autenticado. Faça login para continuar.");
      }
      
      // URL da Edge Function do Supabase
      const projectId = 'zotzvtepvpnkcoobdubt';
      const response = await supabase.functions.invoke('list-panda-videos', {
        body: { limit: 100 }
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao buscar vídeos");
      }

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || "Resposta inválida do servidor");
      }

      const fetchedVideos = response.data.videos || [];
      setVideos(fetchedVideos);
      setSearchResults(fetchedVideos);
      
      // Se temos um ID de vídeo atual, encontrar e selecionar
      if (currentVideoId) {
        const current = fetchedVideos.find(v => v.id === currentVideoId);
        if (current) {
          setSelectedVideo(current);
        }
      }
    } catch (error: any) {
      console.error("Erro ao buscar vídeos:", error);
      setError(error.message || "Erro ao buscar vídeos do Panda Video");
      toast({
        title: "Erro ao carregar vídeos",
        description: error.message || "Não foi possível buscar os vídeos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar vídeos ao montar o componente
  useEffect(() => {
    fetchPandaVideos();
  }, [currentVideoId]);

  // Filtrar vídeos com base no termo de pesquisa
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(videos);
      return;
    }
    
    const filtered = videos.filter(
      video => video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchTerm, videos]);

  // Ordenar resultados
  useEffect(() => {
    const sortedResults = [...searchResults];
    
    switch (sortBy) {
      case "newest":
        sortedResults.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case "oldest":
        sortedResults.sort((a, b) => 
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
        break;
      case "title":
        sortedResults.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "duration":
        sortedResults.sort((a, b) => (b.duration_seconds || 0) - (a.duration_seconds || 0));
        break;
    }
    
    setSearchResults(sortedResults);
  }, [sortBy, searchResults]);

  const handleSelect = (video: PandaVideo) => {
    setSelectedVideo(video);
    onSelect(video);
    toast({
      title: "Vídeo selecionado",
      description: `"${video.title}" foi selecionado com sucesso.`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vídeos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigos</SelectItem>
            <SelectItem value="title">Por título</SelectItem>
            <SelectItem value="duration">Por duração</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchPandaVideos()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          )}
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Video className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>Nenhum vídeo encontrado.</p>
          {searchTerm && (
            <p className="mt-1 text-sm">Tente usar termos de busca diferentes.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {searchResults.map((video) => (
            <Card
              key={video.id}
              className={`overflow-hidden cursor-pointer transition-all ${
                selectedVideo?.id === video.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleSelect(video)}
            >
              <div className="aspect-video bg-gray-100 relative">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {video.duration_seconds && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatVideoDuration(video.duration_seconds)}
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="text-sm font-medium line-clamp-1">{video.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(video.created_at || "").toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
