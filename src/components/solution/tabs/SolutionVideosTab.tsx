
import React from "react";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { VideoGrid } from "./components/VideoGrid";
import { useVideosList } from "@/hooks/solution/useVideosList";

interface SolutionVideosTabProps {
  solution: any;
}

const SolutionVideosTab: React.FC<SolutionVideosTabProps> = ({ solution }) => {
  const { videos, loading, handleVideoView } = useVideosList(solution);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhum vídeo disponível para esta solução.
        </p>
      </div>
    );
  }

  return (
    <div>
      <VideoGrid videos={videos} onVideoClick={handleVideoView} />
    </div>
  );
};

export default SolutionVideosTab;
