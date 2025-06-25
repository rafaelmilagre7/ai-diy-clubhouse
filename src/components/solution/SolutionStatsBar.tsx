
import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, Wrench, Video } from "lucide-react";
import { SolutionStats } from "@/hooks/useSolutionStats";

interface SolutionStatsBarProps {
  stats: SolutionStats;
  loading?: boolean;
}

export const SolutionStatsBar = ({ stats, loading }: SolutionStatsBarProps) => {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 bg-neutral-800 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: <FileText className="h-3 w-3" />,
      label: stats.resourcesCount === 1 ? "recurso" : "recursos",
      count: stats.resourcesCount,
      show: stats.resourcesCount > 0
    },
    {
      icon: <Wrench className="h-3 w-3" />,
      label: stats.toolsCount === 1 ? "ferramenta" : "ferramentas",
      count: stats.toolsCount,
      show: stats.toolsCount > 0
    },
    {
      icon: <Video className="h-3 w-3" />,
      label: stats.videosCount === 1 ? "vídeo" : "vídeos",
      count: stats.videosCount,
      show: stats.videosCount > 0
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {statItems.map((item, index) => 
        item.show && (
          <Badge 
            key={index}
            variant="outline" 
            className="bg-neutral-800/50 text-neutral-300 border-neutral-700 flex items-center gap-1 px-2 py-1"
          >
            {item.icon}
            <span className="text-xs">
              {item.count} {item.label}
            </span>
          </Badge>
        )
      )}
    </div>
  );
};
