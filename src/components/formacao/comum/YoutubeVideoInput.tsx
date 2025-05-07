import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Info, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { extractYouTubeVideoId } from "@/lib/supabase/videoUtils";

interface YoutubeVideoInputProps {
  value: string;
  onChange: (url: string) => void;
  onVideoLoaded?: (title: string) => void;
}

export function YoutubeVideoInput({ value, onChange, onVideoLoaded }: YoutubeVideoInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(false);
  
  // Validar URL do YouTube quando o valor muda
  useEffect(() => {
    if (!value) {
      setIsValidUrl(false);
      setError(null);
      return;
    }
    
    try {
      const videoId = extractYouTubeVideoId(value);
      if (videoId) {
        setIsValidUrl(true);
        setError(null);
        
        // Obter título do vídeo para callback, se fornecido
        if (onVideoLoaded) {
          try {
            // Tentar extrair título da URL ou usar ID como fallback
            const simpleTitle = value.includes('title=') 
              ? decodeURIComponent(value.split('title=')[1].split('&')[0]) 
              : `Vídeo do YouTube (${videoId})`;
            
            onVideoLoaded(simpleTitle);
          } catch (err) {
            console.log("Erro ao extrair título:", err);
            onVideoLoaded(`Vídeo do YouTube (${videoId})`);
          }
        }
      } else {
        setIsValidUrl(false);
        setError("URL do YouTube inválida. Certifique-se de colar a URL completa.");
      }
    } catch (err) {
      console.error("Erro ao processar URL do YouTube:", err);
      setIsValidUrl(false);
      setError("Erro ao processar URL do YouTube. Verifique e tente novamente.");
    }
  }, [value, onVideoLoaded]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          placeholder="Cole a URL do YouTube (ex: https://youtube.com/watch?v=...)"
          className="pl-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Formatos suportados: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
      </p>
      
      {error && (
        <Alert variant="destructive" className="py-2">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
      
      {isValidUrl && value && (
        <div className="mt-4 rounded-md overflow-hidden border">
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeVideoId(value)}`}
              title="Vídeo do YouTube"
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
