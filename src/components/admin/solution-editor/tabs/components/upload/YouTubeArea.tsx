
import React from "react";
import { Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YouTubeAreaProps {
  onYouTubeClick: () => void;
  disabled: boolean;
}

export const YouTubeArea: React.FC<YouTubeAreaProps> = ({
  onYouTubeClick,
  disabled
}) => {
  return (
    <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 transition-all">
      <div className="flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Youtube className="h-8 w-8 text-red-500" />
        </div>
        
        <h3 className="text-lg font-medium mb-1">Vídeo do YouTube</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Adicione vídeos do YouTube de forma rápida e simples
        </p>
        
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={onYouTubeClick}
          disabled={disabled}
        >
          <Youtube className="h-4 w-4" />
          Adicionar vídeo do YouTube
        </Button>
      </div>
    </div>
  );
};
