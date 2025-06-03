
import React from "react";
import { SolutionVideoCard } from "../videos/SolutionVideoCard";
import { SolutionVideosLoading } from "../videos/SolutionVideosLoading";
import { SolutionVideosEmpty } from "../videos/SolutionVideosEmpty";
import { useSolutionDataContext } from "@/contexts/SolutionDataContext";
import { useLogging } from "@/hooks/useLogging";

interface SolutionVideosTabProps {
  solutionId: string;
}

export const SolutionVideosTab = ({ solutionId }: SolutionVideosTabProps) => {
  const { data, isLoading } = useSolutionDataContext();
  const { log } = useLogging();

  if (isLoading) {
    return <SolutionVideosLoading />;
  }

  const videos = data?.videos || [];

  if (videos.length === 0) {
    log("Nenhum vídeo encontrado para a solução", { solutionId });
    return <SolutionVideosEmpty />;
  }

  log("Renderizando vídeos da solução", { solutionId, count: videos.length });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-textPrimary">Vídeo-aulas</h3>
        <p className="text-textSecondary">
          Assista aos vídeos tutoriais para implementar esta solução passo a passo.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {videos.map((video) => (
          <SolutionVideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};
