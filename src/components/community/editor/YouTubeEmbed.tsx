
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface YouTubeEmbedProps {
  onInsertEmbed: (embedHtml: string) => void;
}

export function YouTubeEmbed({ onInsertEmbed }: YouTubeEmbedProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Função para extrair ID do YouTube de uma URL
  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const insertYoutubeVideo = () => {
    const youtubeId = extractYoutubeId(youtubeUrl);
    if (youtubeId) {
      const youtubeEmbed = `<div class="youtube-embed">
        <iframe width="100%" height="315" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>
      </div>`;
      
      onInsertEmbed(youtubeEmbed);
      setYoutubeUrl("");
    } else {
      toast.error("URL do YouTube inválida");
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Adicionar vídeo do YouTube</h3>
      <Input
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
      />
      <Button 
        onClick={insertYoutubeVideo} 
        size="sm" 
        className="w-full"
        disabled={!youtubeUrl.trim()}
      >
        Inserir vídeo
      </Button>
    </div>
  );
}
