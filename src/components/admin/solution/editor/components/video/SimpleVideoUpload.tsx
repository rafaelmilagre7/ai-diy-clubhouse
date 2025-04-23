
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Youtube, Loader2 } from "lucide-react";
import { useVideoUpload } from "./useVideoUpload";

interface SimpleVideoUploadProps {
  solutionId: string | undefined;
}

export const SimpleVideoUpload: React.FC<SimpleVideoUploadProps> = ({ solutionId }) => {
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeData, setYoutubeData] = useState({
    name: "",
    url: "",
    description: ""
  });

  const {
    handleFileUpload,
    handleYoutubeUpload,
    uploading,
    uploadProgress
  } = useVideoUpload({ solutionId });

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="video-upload">
        <Input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading || !solutionId}
        />
        <Button asChild>
          <span>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadProgress.toFixed(0)}%
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload de Vídeo
              </>
            )}
          </span>
        </Button>
      </label>

      <Button onClick={() => setYoutubeOpen(true)} variant="outline">
        <Youtube className="mr-2 h-4 w-4" />
        Adicionar do YouTube
      </Button>

      <Dialog open={youtubeOpen} onOpenChange={setYoutubeOpen}>
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
                onChange={(e) => setYoutubeData({ ...youtubeData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube-url">URL do YouTube</Label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeData.url}
                onChange={(e) => setYoutubeData({ ...youtubeData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube-description">Descrição (opcional)</Label>
              <Textarea
                id="youtube-description"
                placeholder="Descrição do vídeo"
                value={youtubeData.description}
                onChange={(e) => setYoutubeData({ ...youtubeData, description: e.target.value })}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                handleYoutubeUpload(youtubeData);
                setYoutubeOpen(false);
                setYoutubeData({ name: "", url: "", description: "" });
              }}
              disabled={uploading || !youtubeData.name || !youtubeData.url}
            >
              {uploading ? (
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
    </div>
  );
};
