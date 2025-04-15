
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface YoutubeBlockProps {
  data: {
    youtubeId: string;
    caption?: string;
  };
  onChange: (data: any) => void;
}

const YoutubeBlock: React.FC<YoutubeBlockProps> = ({ data, onChange }) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to extract YouTube video ID from URL
  const getYoutubeId = (url: string) => {
    if (!url) return "";
    
    try {
      let videoId = "";
      
      if (url.includes("youtube.com/watch")) {
        videoId = new URL(url).searchParams.get("v") || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
      }
      
      return videoId;
    } catch (e) {
      console.error("Error parsing YouTube URL:", e);
      return "";
    }
  };

  // Process the URL when submitted
  const processYoutubeUrl = () => {
    setError(null);
    setLoading(true);
    
    try {
      const id = getYoutubeId(youtubeUrl);
      
      if (!id) {
        setError("URL inválido do YouTube. Por favor, verifique o formato.");
        setLoading(false);
        return;
      }
      
      onChange({ youtubeId: id });
      setYoutubeUrl("");
    } catch (e) {
      setError("Erro ao processar o URL do YouTube");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Cole o URL do vídeo YouTube (ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
            onKeyDown={(e) => e.key === "Enter" && processYoutubeUrl()}
          />
          <Button 
            type="button" 
            onClick={processYoutubeUrl}
            disabled={loading || !youtubeUrl.trim()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Extrair ID"}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            value={data.youtubeId}
            onChange={(e) => onChange({ youtubeId: e.target.value })}
            placeholder="ID do vídeo do YouTube"
            className="mb-2"
          />
          <Textarea
            value={data.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Legenda (opcional)"
            rows={3}
          />
        </div>
        
        {data.youtubeId && (
          <div className="border rounded overflow-hidden">
            <div className="bg-gray-50 p-2 text-xs text-muted-foreground border-b">
              Preview do vídeo
            </div>
            <div className="relative pb-[56.25%] h-0">
              <iframe
                src={`https://www.youtube.com/embed/${data.youtubeId}`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YoutubeBlock;
