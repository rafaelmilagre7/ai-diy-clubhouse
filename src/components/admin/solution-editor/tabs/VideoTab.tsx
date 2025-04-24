
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useVideoManagement } from "@/hooks/admin/useVideoManagement";
import VideoHeader from "./videos/VideoHeader";
import EmptyVideoState from "./components/EmptyVideoState";
import VideosList from "./components/VideosList";
import YouTubeVideoForm from "./components/YouTubeVideoForm";

interface VideoTabProps {
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

const VideoTab: React.FC<VideoTabProps> = ({
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  const {
    videos,
    loading,
    uploading,
    uploadProgress,
    youtubeDialogOpen,
    setYoutubeDialogOpen,
    handleAddYouTube,
    handleFileUpload,
    handleRemoveVideo,
    fetchVideos
  } = useVideoManagement(solution?.id);

  // Forçar a atualização da lista de vídeos quando o componente é montado
  useEffect(() => {
    console.log("[VideoTab] Componente montado, buscando vídeos...");
    fetchVideos();
  }, [solution?.id, fetchVideos]);

  const handleUploadFile = async (file: File) => {
    console.log("[VideoTab] Arquivo selecionado:", file.name);
    const success = await handleFileUpload(file);
    
    if (success) {
      console.log("[VideoTab] Upload realizado com sucesso, recarregando vídeos");
      await fetchVideos();
    }
  };

  return (
    <div className="space-y-8">
      <VideoHeader
        solutionId={solution?.id}
        onYoutubeClick={() => setYoutubeDialogOpen(true)}
        onFileUpload={handleUploadFile}
        isUploading={uploading}
        uploadProgress={uploadProgress}
      />

      <Card className="border-2 border-[#0ABAB5]/10 shadow-sm">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0ABAB5]" />
                <span className="mt-2 text-sm text-muted-foreground">Carregando vídeos...</span>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <EmptyVideoState 
              onYoutubeClick={() => setYoutubeDialogOpen(true)}
              onFileUploadClick={() => document.getElementById('video-file-input')?.click()}
              solutionId={solution?.id}
              uploading={uploading}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#0ABAB5]">
                  Vídeos adicionados ({videos.length})
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchVideos}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar lista
                </Button>
              </div>
              <VideosList videos={videos} onRemove={handleRemoveVideo} />
            </>
          )}
        </CardContent>
      </Card>

      <YouTubeVideoForm
        isOpen={youtubeDialogOpen}
        onOpenChange={setYoutubeDialogOpen}
        onAddYouTube={handleAddYouTube}
        isUploading={uploading}
      />
    </div>
  );
};

export default VideoTab;
