
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useVideoManagement } from "@/hooks/admin/useVideoManagement";
import VideoHeader from "./videos/VideoHeader";
import EmptyVideoState from "../components/EmptyVideoState";
import VideosList from "../components/VideosList";
import YouTubeVideoForm from "../components/YouTubeVideoForm";

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
    fetchVideos,
    handleAddYouTube,
    handleFileUpload,
    handleRemoveVideo
  } = useVideoManagement(solution?.id);

  useEffect(() => {
    if (solution?.id) {
      fetchVideos();
    }
  }, [solution?.id]);

  return (
    <div className="space-y-8">
      <VideoHeader
        solutionId={solution?.id}
        onYoutubeClick={() => setYoutubeDialogOpen(true)}
        onFileUpload={handleFileUpload}
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
            <VideosList videos={videos} onRemove={handleRemoveVideo} />
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
