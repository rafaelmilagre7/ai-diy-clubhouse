
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Youtube } from "lucide-react";

interface YouTubeVideoFormProps {
  onAddYouTube: (data: {
    name: string;
    url: string;
    description: string;
  }) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isUploading: boolean;
}

const YouTubeVideoForm: React.FC<YouTubeVideoFormProps> = ({
  onAddYouTube,
  isOpen,
  onOpenChange,
  isUploading,
}) => {
  const [youtubeData, setYoutubeData] = useState({
    name: "",
    url: "",
    description: "",
  });

  const handleSubmit = async () => {
    await onAddYouTube(youtubeData);
    setYoutubeData({ name: "", url: "", description: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Youtube className="mr-2 h-4 w-4" />
          Adicionar do YouTube
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar vídeo do YouTube</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-name">Título do vídeo</Label>
            <Input
              id="youtube-name"
              placeholder="Título do vídeo"
              value={youtubeData.name}
              onChange={(e) =>
                setYoutubeData({ ...youtubeData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube-url">URL do YouTube</Label>
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeData.url}
              onChange={(e) =>
                setYoutubeData({ ...youtubeData, url: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Ex: https://www.youtube.com/watch?v=abcdefghijk
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube-description">Descrição (opcional)</Label>
            <Textarea
              id="youtube-description"
              placeholder="Descrição do vídeo"
              value={youtubeData.description}
              onChange={(e) =>
                setYoutubeData({ ...youtubeData, description: e.target.value })
              }
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isUploading || !youtubeData.name || !youtubeData.url}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adicionando...
              </>
            ) : (
              "Adicionar Vídeo"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeVideoForm;
