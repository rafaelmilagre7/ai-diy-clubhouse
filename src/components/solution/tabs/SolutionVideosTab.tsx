
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SolutionVideoCard } from "../videos/SolutionVideoCard";
import { SolutionVideosLoading } from "../videos/SolutionVideosLoading";
import { SolutionVideosEmpty } from "../videos/SolutionVideosEmpty";
import { useLogging } from "@/hooks/useLogging";

interface SolutionVideosTabProps {
  solutionId: string;
}

export const SolutionVideosTab = ({ solutionId }: SolutionVideosTabProps) => {
  const { log, logError } = useLogging();

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['solution-videos', solutionId],
    queryFn: async () => {
      log("Buscando vídeos da solução", { solutionId });
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .in("type", ["video", "youtube"])
        .order("created_at", { ascending: true });
      
      if (error) {
        logError("Erro ao buscar vídeos", error);
        throw error;
      }
      
      log("Vídeos encontrados", { count: data?.length || 0 });
      return data || [];
    },
    enabled: !!solutionId,
    staleTime: 5 * 60 * 1000
  });

  if (error) {
    logError("Erro ao exibir vídeos", error);
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Erro ao carregar vídeos desta solução.</p>
      </div>
    );
  }

  if (isLoading) {
    return <SolutionVideosLoading />;
  }

  if (!videos || videos.length === 0) {
    return <SolutionVideosEmpty />;
  }

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
