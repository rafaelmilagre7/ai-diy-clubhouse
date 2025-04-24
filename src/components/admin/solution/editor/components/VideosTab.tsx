import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useVideos } from "./video/useVideos";
import YouTubeVideoForm from "./video/YouTubeVideoForm";
import FileVideoUploader from "./video/FileVideoUploader";
import VideosList from "./video/VideosList";
import EmptyVideoState from "./video/EmptyVideoState";
import VideoUploadHeader from "./video/VideoUploadHeader";
interface VideosTabProps {
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}
const VideosTab: React.FC<VideosTabProps> = ({
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
    addYouTubeOpen,
    setAddYouTubeOpen,
    handleAddYouTube,
    handleVideoFileUpload,
    handleRemove
  } = useVideos({
    solutionId: solution?.id
  });
  return <div className="space-y-6">
      <Card className="border-2 border-[#0ABAB5]/10">
        
        <CardContent>
          {!solution?.id && <div className="flex items-center p-4 gap-2 bg-amber-50 border border-amber-200 rounded-md mb-4">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-800">
                Salve as informações básicas antes de adicionar vídeos.
              </p>
            </div>}
          
          {loading ? <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div> : videos.length === 0 ? <EmptyVideoState onFileChange={handleVideoFileUpload} onYouTubeClick={() => setAddYouTubeOpen(true)} uploading={uploading} solutionId={solution?.id} /> : <VideosList videos={videos} onRemove={handleRemove} />}
        </CardContent>
      </Card>

      <YouTubeVideoForm onAddYouTube={handleAddYouTube} isOpen={addYouTubeOpen} onOpenChange={setAddYouTubeOpen} isUploading={uploading} />
    </div>;
};
export default VideosTab;