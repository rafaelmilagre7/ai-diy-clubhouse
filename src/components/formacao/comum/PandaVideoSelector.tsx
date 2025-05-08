
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Função para listar vídeos existentes
  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular chamada para edge function
      // Em produção, substituir por uma chamada real à edge function que obtém os vídeos do Panda
      
      // Consultar vídeos existentes de lições
      const { data, error } = await supabase
        .from('learning_lesson_videos')
        .select('*')
        .eq('video_type', 'panda')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        throw new Error(`Erro ao carregar vídeos: ${error.message}`);
      }
      
      // Transformar em formato PandaVideo
      const formattedVideos: PandaVideo[] = data?.map(video => ({
        id: video.video_file_path || video.id,
        title: video.title || 'Vídeo sem título',
        description: video.description || '',
        url: video.url,
        thumbnail_url: video.thumbnail_url,
        duration_seconds: video.duration_seconds,
        created_at: video.created_at
      })) || [];
      
      setVideos(formattedVideos);
    } catch (err: any) {
      console.error("Erro ao carregar vídeos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar vídeos na montagem do componente
  useEffect(() => {
    loadVideos();
  }, []);
  
  // Função para filtrar vídeos com base na busca
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vídeos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={loadVideos}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar'}
        </Button>
      </div>
      
      {error && (
        <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive text-center">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2" 
            onClick={loadVideos}
          >
            Tentar novamente
          </Button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-md">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhum vídeo encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Faça upload de vídeos para poder selecioná-los
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto p-2">
          {filteredVideos.map((video) => (
            <Card 
              key={video.id} 
              className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                currentVideoId === video.id ? 'border-primary' : ''
              }`}
              onClick={() => onSelect(video)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-24 h-16 bg-muted relative overflow-hidden rounded">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Video className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  {video.duration_seconds && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {formatVideoDuration(video.duration_seconds)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{video.title}</h4>
                  {video.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {video.description}
                    </p>
                  )}
                </div>
                {currentVideoId === video.id && (
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
